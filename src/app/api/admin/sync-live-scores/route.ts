import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiFootball, PREMIER_LEAGUE_ID, CURRENT_SEASON } from '@/lib/football-api';

const prisma = new PrismaClient();

// Map API-Football status to our FixtureStatus enum
function mapFixtureStatus(apiStatus: string): 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' {
  switch (apiStatus) {
    case 'NS': case 'TBD': return 'SCHEDULED';
    case '1H': case '2H': case 'HT': case 'ET': case 'BT': case 'P': case 'SUSP': case 'INT': return 'LIVE';
    case 'FT': case 'AET': case 'PEN': return 'FINISHED';
    case 'PST': return 'POSTPONED';
    case 'CANC': case 'ABD': return 'CANCELLED';
    default: return 'SCHEDULED';
  }
}

async function updateUserStats() {
  // Update user total points and stats after points calculation
  const users = await prisma.user.findMany({
    include: {
      predictions: {
        where: {
          status: 'SUBMITTED',
          points: { not: null }
        }
      }
    }
  });

  for (const user of users) {
    const totalPoints = user.predictions.reduce((sum, pred) => sum + (pred.points || 0), 0);
    const totalPredictions = user.predictions.length;
    const correctPredictions = user.predictions.filter(pred => pred.isCorrect).length;
    const accuracyRate = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPoints,
        totalPredictions,
        correctPredictions,
        accuracyRate
      }
    });
  }
}

// POST /api/admin/sync-live-scores - Poll for live score updates
export async function POST(request: NextRequest) {
  try {
    console.log('⚽ Starting live scores sync...');
    
    // Get current API usage
    let apiSync = await prisma.apiSync.findUnique({
      where: { type: 'live_scores' }
    });
    
    if (!apiSync) {
      apiSync = await prisma.apiSync.create({
        data: { type: 'live_scores', apiCalls: 0 }
      });
    }
    
    // Reset daily counter if it's a new day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSyncDate = new Date(apiSync.lastSync);
    lastSyncDate.setHours(0, 0, 0, 0);
    
    if (lastSyncDate < today) {
      apiSync = await prisma.apiSync.update({
        where: { type: 'live_scores' },
        data: { apiCalls: 0, lastSync: new Date() }
      });
    }
    
    // Check total API calls across both endpoints
    const fixturesSync = await prisma.apiSync.findUnique({
      where: { type: 'fixtures' }
    });
    
    const totalCalls = apiSync.apiCalls + (fixturesSync?.apiCalls || 0);
    
    if (totalCalls >= 100) {
      console.log('⚠️ Daily API limit reached, skipping live sync');
      return NextResponse.json({
        success: false,
        message: 'Daily API limit reached',
        totalApiCalls: totalCalls
      }, { status: 429 });
    }

    // Strategy: Only poll for fixtures that should be live or recently finished
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    // Find fixtures that could be live (kickoff between 4 hours ago and 2 hours from now)
    const potentiallyLiveFixtures = await prisma.fixture.findMany({
      where: {
        kickoffTime: {
          gte: fourHoursAgo,
          lte: twoHoursFromNow
        },
        status: {
          in: ['SCHEDULED', 'LIVE'] // Only check scheduled or already live fixtures
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });
    
    if (potentiallyLiveFixtures.length === 0) {
      console.log('📅 No fixtures expected to be live right now');
      return NextResponse.json({
        success: true,
        message: 'No live fixtures to check',
        totalApiCalls: totalCalls
      });
    }
    
    console.log(`🔍 Checking ${potentiallyLiveFixtures.length} potentially live fixtures`);
    
    // Get today's fixtures to include any live matches
    let apiCallCount = apiSync.apiCalls;
    const todaysFixtures = await apiFootball.getTodaysFixtures();
    apiCallCount++;
    
    let updatedCount = 0;
    let liveCount = 0;
    let finishedCount = 0;
    
    // Process today's fixtures and update any that exist in our database
    for (const fixtureData of todaysFixtures.response) {
      const existingFixture = await prisma.fixture.findUnique({
        where: { apiId: fixtureData.fixture.id }
      });
      
      if (!existingFixture) continue; // Skip fixtures not in our database
      
      const newStatus = mapFixtureStatus(fixtureData.fixture.status.short);
      const homeScore = fixtureData.goals.home;
      const awayScore = fixtureData.goals.away;
      
      // Only update if something has changed
      const hasChanged = 
        existingFixture.status !== newStatus ||
        existingFixture.homeScore !== homeScore ||
        existingFixture.awayScore !== awayScore;
      
      if (hasChanged) {
        await prisma.fixture.update({
          where: { apiId: fixtureData.fixture.id },
          data: {
            status: newStatus,
            homeScore,
            awayScore,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
        
        if (newStatus === 'LIVE') {
          liveCount++;
        } else if (newStatus === 'FINISHED') {
          finishedCount++;
          
          // Trigger points calculation for predictions when match finishes
          try {
            const { calculatePoints } = await import('@/lib/points');
            
            // Get all submitted predictions for this fixture
            const predictions = await prisma.prediction.findMany({
              where: {
                fixtureId: existingFixture.id,
                status: 'SUBMITTED',
                points: null // Only calculate for unprocessed predictions
              },
              include: {
                user: {
                  select: { email: true }
                }
              }
            });

            if (predictions.length > 0 && homeScore !== null && awayScore !== null) {
              // Calculate points for each prediction
              for (const prediction of predictions) {
                const pointsResult = calculatePoints(
                  prediction.homeScore,
                  prediction.awayScore,
                  homeScore,
                  awayScore
                );

                // Update prediction with calculated points
                await prisma.prediction.update({
                  where: { id: prediction.id },
                  data: {
                    points: pointsResult.points,
                    isCorrect: pointsResult.isCorrect
                  }
                });
              }

              console.log(`🎯 Match finished and scored: ${existingFixture.id} (${predictions.length} predictions calculated)`);
              
              // Update user stats after calculating points
              await updateUserStats();
            }
          } catch (scoreError) {
            console.error(`❌ Error calculating points for fixture ${existingFixture.id}:`, scoreError);
          }
        }
      }
    }
    
    // Update API call count
    await prisma.apiSync.update({
      where: { type: 'live_scores' },
      data: {
        apiCalls: apiCallCount,
        lastSync: new Date()
      }
    });
    
    const newTotalCalls = apiCallCount + (fixturesSync?.apiCalls || 0);
    
    console.log(`✅ Live scores sync completed: ${updatedCount} fixtures updated (${liveCount} live, ${finishedCount} finished)`);
    console.log(`📊 API calls used today: ${newTotalCalls}/100`);
    
    return NextResponse.json({
      success: true,
      message: 'Live scores sync completed',
      stats: {
        fixturesChecked: potentiallyLiveFixtures.length,
        fixturesUpdated: updatedCount,
        currentlyLive: liveCount,
        newlyFinished: finishedCount
      },
      totalApiCalls: newTotalCalls
    });
    
  } catch (error) {
    console.error('❌ Error syncing live scores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during live scores sync',
        totalApiCalls: ((await prisma.apiSync.findUnique({ where: { type: 'live_scores' } }))?.apiCalls || 0) +
                      ((await prisma.apiSync.findUnique({ where: { type: 'fixtures' } }))?.apiCalls || 0)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/admin/sync-live-scores - Check live sync status and current live fixtures
export async function GET(request: NextRequest) {
  try {
    const apiSync = await prisma.apiSync.findUnique({
      where: { type: 'live_scores' }
    });
    
    const fixturesSync = await prisma.apiSync.findUnique({
      where: { type: 'fixtures' }
    });
    
    // Get currently live fixtures
    const liveFixtures = await prisma.fixture.findMany({
      where: { status: 'LIVE' },
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } }
      },
      orderBy: { kickoffTime: 'asc' }
    });
    
    // Get recently finished fixtures (last 4 hours)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const recentlyFinished = await prisma.fixture.findMany({
      where: { 
        status: 'FINISHED',
        updatedAt: { gte: fourHoursAgo }
      },
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } }
      },
      orderBy: { kickoffTime: 'desc' },
      take: 10
    });
    
    const totalApiCalls = (apiSync?.apiCalls || 0) + (fixturesSync?.apiCalls || 0);
    
    return NextResponse.json({
      success: true,
      lastSync: apiSync?.lastSync || null,
      liveScoreApiCalls: apiSync?.apiCalls || 0,
      fixturesApiCalls: fixturesSync?.apiCalls || 0,
      totalApiCalls,
      currentlyLive: liveFixtures,
      recentlyFinished
    });
    
  } catch (error) {
    console.error('❌ Error checking live sync status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check live sync status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}