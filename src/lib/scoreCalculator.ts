import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Points system for predictions
const POINTS = {
  EXACT_SCORE: 5,     // Exact score match
  CORRECT_OUTCOME: 3, // Correct winner/draw
  INCORRECT: 0        // Wrong prediction
} as const;

export interface ScoreResult {
  predictionId: string;
  points: number;
  isCorrect: boolean;
  predictionType: 'exact' | 'outcome' | 'incorrect';
}

// Calculate points for a single prediction
export function calculatePredictionScore(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): { points: number; isCorrect: boolean; type: 'exact' | 'outcome' | 'incorrect' } {
  
  // Check for exact score match
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return {
      points: POINTS.EXACT_SCORE,
      isCorrect: true,
      type: 'exact'
    };
  }
  
  // Check for correct outcome (winner/draw)
  const predictedOutcome = getOutcome(predictedHome, predictedAway);
  const actualOutcome = getOutcome(actualHome, actualAway);
  
  if (predictedOutcome === actualOutcome) {
    return {
      points: POINTS.CORRECT_OUTCOME,
      isCorrect: true,
      type: 'outcome'
    };
  }
  
  // Incorrect prediction
  return {
    points: POINTS.INCORRECT,
    isCorrect: false,
    type: 'incorrect'
  };
}

// Helper function to determine match outcome
function getOutcome(homeScore: number, awayScore: number): 'home' | 'draw' | 'away' {
  if (homeScore > awayScore) return 'home';
  if (homeScore < awayScore) return 'away';
  return 'draw';
}

// Calculate scores for all predictions of a finished fixture
export async function calculateFixtureScores(fixtureId: string): Promise<ScoreResult[]> {
  try {
    // Get the fixture with actual scores
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } }
      }
    });
    
    if (!fixture || fixture.status !== 'FINISHED' || fixture.homeScore === null || fixture.awayScore === null) {
      console.warn(`Fixture ${fixtureId} is not finished or has no scores`);
      return [];
    }
    
    // Get all predictions for this fixture
    const predictions = await prisma.prediction.findMany({
      where: { 
        fixtureId: fixtureId,
        isSubmitted: true // Only calculate scores for submitted predictions
      },
      include: {
        user: { select: { id: true, displayName: true } }
      }
    });
    
    console.log(`📊 Calculating scores for ${predictions.length} predictions on ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`);
    console.log(`⚽ Final Score: ${fixture.homeScore}-${fixture.awayScore}`);
    
    const results: ScoreResult[] = [];
    
    // Calculate score for each prediction and update in database
    for (const prediction of predictions) {
      const scoreResult = calculatePredictionScore(
        prediction.homeScore,
        prediction.awayScore,
        fixture.homeScore,
        fixture.awayScore
      );
      
      // Update prediction with calculated score
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          points: scoreResult.points,
          isCorrect: scoreResult.isCorrect
        }
      });
      
      // Update user's total points and stats
      await updateUserStats(prediction.userId, scoreResult.points, scoreResult.isCorrect);
      
      results.push({
        predictionId: prediction.id,
        points: scoreResult.points,
        isCorrect: scoreResult.isCorrect,
        predictionType: scoreResult.type
      });
      
      console.log(`✅ ${prediction.user.displayName}: predicted ${prediction.homeScore}-${prediction.awayScore}, got ${scoreResult.points} points (${scoreResult.type})`);
    }
    
    console.log(`🎉 Calculated scores for ${results.length} predictions`);
    return results;
    
  } catch (error) {
    console.error('❌ Error calculating fixture scores:', error);
    throw error;
  }
}

// Update user statistics after scoring
async function updateUserStats(userId: string, points: number, isCorrect: boolean): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) return;
    
    // Calculate new streak
    let newStreak = user.currentStreak;
    if (isCorrect) {
      newStreak += 1;
    } else {
      newStreak = 0;
    }
    
    const newBestStreak = Math.max(user.bestStreak, newStreak);
    const newTotalPredictions = user.totalPredictions + 1;
    const newCorrectPredictions = user.correctPredictions + (isCorrect ? 1 : 0);
    const newAccuracyRate = (newCorrectPredictions / newTotalPredictions) * 100;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
        totalPredictions: newTotalPredictions,
        correctPredictions: newCorrectPredictions,
        accuracyRate: newAccuracyRate,
        currentStreak: newStreak,
        bestStreak: newBestStreak
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    throw error;
  }
}

// Calculate scores for all finished fixtures that haven't been scored yet
export async function calculateAllPendingScores(): Promise<{ processedFixtures: number; totalScores: number }> {
  try {
    console.log('🔄 Looking for finished fixtures with unscored predictions...');
    
    // Find finished fixtures that have predictions without scores
    const fixtures = await prisma.fixture.findMany({
      where: {
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null },
        predictions: {
          some: {
            isSubmitted: true,
            points: null // Predictions that haven't been scored yet
          }
        }
      },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        _count: {
          select: {
            predictions: {
              where: {
                isSubmitted: true,
                points: null
              }
            }
          }
        }
      }
    });
    
    console.log(`📋 Found ${fixtures.length} fixtures with unscored predictions`);
    
    let totalScores = 0;
    
    for (const fixture of fixtures) {
      console.log(`⚽ Processing ${fixture.homeTeam.name} vs ${fixture.awayTeam.name} (${fixture._count.predictions} predictions)`);
      
      const results = await calculateFixtureScores(fixture.id);
      totalScores += results.length;
    }
    
    console.log(`🎯 Processed ${fixtures.length} fixtures and calculated ${totalScores} prediction scores`);
    
    return {
      processedFixtures: fixtures.length,
      totalScores
    };
    
  } catch (error) {
    console.error('❌ Error calculating pending scores:', error);
    throw error;
  }
}

export { POINTS };