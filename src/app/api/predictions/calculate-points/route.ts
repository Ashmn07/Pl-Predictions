import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePoints } from '@/lib/points';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (for now, only admins can trigger points calculation)
    if (session.user.email !== 'admin@plpredictions.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { fixtureId } = body;

    console.log(`🧮 Calculating points for fixture: ${fixtureId || 'all finished fixtures'}`);

    // Find finished fixtures that need points calculation
    let fixtures;
    if (fixtureId) {
      // Calculate for specific fixture
      fixtures = await prisma.fixture.findMany({
        where: {
          id: fixtureId,
          status: 'FINISHED',
          homeScore: { not: null },
          awayScore: { not: null }
        },
        include: {
          homeTeam: {
            select: {
              name: true
            }
          },
          awayTeam: {
            select: {
              name: true
            }
          },
          predictions: {
            where: {
              status: 'SUBMITTED'
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          }
        }
      });
    } else {
      // Calculate for all finished fixtures that haven't been processed
      fixtures = await prisma.fixture.findMany({
        where: {
          status: 'FINISHED',
          homeScore: { not: null },
          awayScore: { not: null },
          predictions: {
            some: {
              status: 'SUBMITTED',
              points: null // Only fixtures with unprocessed predictions
            }
          }
        },
        include: {
          predictions: {
            where: {
              status: 'SUBMITTED',
              points: null // Only unprocessed predictions
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          }
        }
      });
    }

    if (fixtures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fixtures found that need points calculation',
        processed: 0
      });
    }

    let totalPredictionsProcessed = 0;
    const results = [];

    for (const fixture of fixtures) {
      const fixtureResult = {
        fixtureId: fixture.id,
        homeTeam: fixture.homeTeam?.name || 'Unknown',
        awayTeam: fixture.awayTeam?.name || 'Unknown',
        actualScore: `${fixture.homeScore}-${fixture.awayScore}`,
        predictionsProcessed: 0,
        predictions: [] as any[]
      };

      for (const prediction of fixture.predictions) {
        // Calculate points for this prediction
        const pointsCalculation = calculatePoints(
          prediction.homeScore,
          prediction.awayScore,
          fixture.homeScore!,
          fixture.awayScore!
        );

        // Update the prediction with calculated points
        await prisma.prediction.update({
          where: { id: prediction.id },
          data: {
            points: pointsCalculation.points,
            isCorrect: pointsCalculation.isCorrect
          }
        });

        fixtureResult.predictions.push({
          userId: prediction.user.email,
          predictedScore: `${prediction.homeScore}-${prediction.awayScore}`,
          points: pointsCalculation.points,
          category: pointsCalculation.category,
          description: pointsCalculation.description
        });

        fixtureResult.predictionsProcessed++;
        totalPredictionsProcessed++;
      }

      results.push(fixtureResult);
    }

    // Update user total points and stats
    const userStats = await prisma.user.findMany({
      include: {
        predictions: {
          where: {
            status: 'SUBMITTED',
            points: { not: null }
          }
        }
      }
    });

    for (const user of userStats) {
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

    console.log(`✅ Points calculation completed: ${totalPredictionsProcessed} predictions processed`);

    return NextResponse.json({
      success: true,
      message: `Successfully calculated points for ${totalPredictionsProcessed} predictions across ${fixtures.length} fixtures`,
      processed: totalPredictionsProcessed,
      fixtures: fixtures.length,
      results
    });

  } catch (error) {
    console.error('❌ Error calculating points:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to calculate points'
      },
      { status: 500 }
    );
  }
}