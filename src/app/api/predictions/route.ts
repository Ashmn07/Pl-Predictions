import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isGameweekLocked } from '@/lib/gameweek-utils';

// GET /api/predictions - Get user's predictions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const gameweek = searchParams.get('gameweek');
    const season = searchParams.get('season') || '2025-26';
    const fixtureId = searchParams.get('fixtureId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let where: any = {
      userId: user.id
    };

    if (fixtureId) {
      where.fixtureId = fixtureId;
    } else {
      if (gameweek) {
        where.fixture = {
          gameweek: parseInt(gameweek),
          season: season
        };
      } else if (season) {
        where.fixture = {
          season: season
        };
      }
    }

    const predictions = await prisma.prediction.findMany({
      where,
      include: {
        fixture: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
              }
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
              }
            }
          }
        }
      },
      orderBy: {
        fixture: {
          kickoffTime: 'asc'
        }
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      count: predictions.length,
      predictions: predictions.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        submittedAt: p.submittedAt?.toISOString() || null,
        fixture: {
          ...p.fixture,
          kickoffTime: p.fixture.kickoffTime.toISOString(),
          createdAt: p.fixture.createdAt.toISOString(),
          updatedAt: p.fixture.updatedAt.toISOString(),
        }
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching predictions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch predictions'
      }, 
      { status: 500 }
    );
  }
}

// POST /api/predictions - Create or update prediction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { fixtureId, homeScore, awayScore, gameweek, season, isSubmitted = false, confidence = 50 } = body;

    // Validate required fields
    if (!fixtureId || homeScore === undefined || awayScore === undefined || !gameweek || !season) {
      return NextResponse.json(
        { error: 'Missing required fields: fixtureId, homeScore, awayScore, gameweek, season' },
        { status: 400 }
      );
    }

    // Validate scores are non-negative integers
    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return NextResponse.json(
        { error: 'Scores must be non-negative integers' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving prediction for user ${user.email}, fixture ${fixtureId}: ${homeScore}-${awayScore} (${isSubmitted ? 'SUBMITTED' : 'DRAFT'})`);
    console.log('Prediction data:', { userId: user.id, fixtureId, homeScore, awayScore, confidence, isSubmitted, gameweek, season });

    // Check if fixture exists and is still upcoming
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } }
      }
    });

    if (!fixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    // Check if gameweek is locked (get all fixtures for the gameweek to check)
    const allFixtures = await prisma.fixture.findMany({
      where: { gameweek: fixture.gameweek, season: fixture.season },
      select: { 
        id: true, 
        gameweek: true, 
        kickoffTime: true, 
        status: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } }
      }
    });

    // Convert to Match format for the utility function
    const fixturesForCheck = allFixtures.map(f => ({
      id: f.id,
      gameweek: f.gameweek,
      kickoff: f.kickoffTime.toISOString(),
      status: f.status,
      homeTeam: { name: f.homeTeam.name, logo: '' },
      awayTeam: { name: f.awayTeam.name, logo: '' },
      season: fixture.season,
      homeScore: null,
      awayScore: null
    }));

    if (isGameweekLocked(fixturesForCheck, fixture.gameweek)) {
      return NextResponse.json({ 
        error: 'Predictions are locked for this gameweek. Deadline has passed.' 
      }, { status: 400 });
    }

    // Only check for started matches if trying to submit (not for drafts)
    if (isSubmitted && (fixture.status !== 'SCHEDULED' || new Date() >= fixture.kickoffTime)) {
      return NextResponse.json({ 
        error: 'Cannot submit predictions for fixtures that have already started' 
      }, { status: 400 });
    }

    // Upsert prediction (create or update)
    let predictionData;
    try {
      predictionData = await prisma.prediction.upsert({
        where: {
          userId_fixtureId: {
            userId: user.id,
            fixtureId
          }
        },
        update: {
          homeScore,
          awayScore,
          confidence: Math.max(1, Math.min(100, confidence)),
          isSubmitted,
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          fixtureId,
          homeScore,
          awayScore,
          confidence: Math.max(1, Math.min(100, confidence)),
          isSubmitted
        },
        include: {
          fixture: {
            include: {
              homeTeam: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  logoUrl: true,
                }
              },
              awayTeam: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  logoUrl: true,
                }
              }
            }
          }
        }
      });
    } catch (dbError) {
      console.error('Database error details:', dbError);
      throw dbError;
    }

    console.log('✅ Prediction saved successfully');

    return NextResponse.json({
      success: true,
      prediction: {
        ...predictionData,
        createdAt: predictionData.createdAt.toISOString(),
        updatedAt: predictionData.updatedAt.toISOString(),
        submittedAt: predictionData.submittedAt?.toISOString() || null,
        fixture: {
          ...predictionData.fixture,
          kickoffTime: predictionData.fixture.kickoffTime.toISOString(),
          createdAt: predictionData.fixture.createdAt.toISOString(),
          updatedAt: predictionData.fixture.updatedAt.toISOString(),
        }
      }
    });
  } catch (error) {
    console.error('❌ Error saving prediction:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to save prediction'
      }, 
      { status: 500 }
    );
  }
}