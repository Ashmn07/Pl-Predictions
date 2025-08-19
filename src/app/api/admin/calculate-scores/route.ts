import { NextRequest, NextResponse } from 'next/server';
import { calculateAllPendingScores, calculateFixtureScores } from '@/lib/scoreCalculator';

// POST /api/admin/calculate-scores - Calculate scores for finished fixtures
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fixtureId = searchParams.get('fixtureId');
    
    console.log('🎯 Starting score calculation process...');
    
    if (fixtureId) {
      // Calculate scores for a specific fixture
      console.log(`📊 Calculating scores for fixture: ${fixtureId}`);
      
      const results = await calculateFixtureScores(fixtureId);
      
      return NextResponse.json({
        success: true,
        message: `Calculated scores for ${results.length} predictions`,
        fixture: fixtureId,
        results: results.map(r => ({
          predictionId: r.predictionId,
          points: r.points,
          type: r.predictionType,
          correct: r.isCorrect
        }))
      });
      
    } else {
      // Calculate scores for all pending fixtures
      console.log('📊 Calculating scores for all pending fixtures...');
      
      const { processedFixtures, totalScores } = await calculateAllPendingScores();
      
      return NextResponse.json({
        success: true,
        message: `Calculated scores for ${totalScores} predictions across ${processedFixtures} fixtures`,
        stats: {
          processedFixtures,
          totalScores
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error calculating scores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during score calculation'
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/calculate-scores - Get scoring statistics
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Get stats about scored vs unscored predictions
    const [totalPredictions, scoredPredictions, finishedFixtures, unscoredFinishedFixtures] = await Promise.all([
      prisma.prediction.count({
        where: { isSubmitted: true }
      }),
      prisma.prediction.count({
        where: { 
          isSubmitted: true,
          points: { not: null }
        }
      }),
      prisma.fixture.count({
        where: { status: 'FINISHED' }
      }),
      prisma.fixture.count({
        where: {
          status: 'FINISHED',
          predictions: {
            some: {
              isSubmitted: true,
              points: null
            }
          }
        }
      })
    ]);
    
    const unscoredPredictions = totalPredictions - scoredPredictions;
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalPredictions,
        scoredPredictions,
        unscoredPredictions,
        finishedFixtures,
        unscoredFinishedFixtures,
        scoringProgress: totalPredictions > 0 ? (scoredPredictions / totalPredictions * 100).toFixed(1) : '0.0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting scoring stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scoring statistics' },
      { status: 500 }
    );
  }
}