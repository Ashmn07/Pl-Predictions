// Points calculation utility for predictions

export interface PointsCalculation {
  points: number;
  isCorrect: boolean;
  category: 'exact' | 'result' | 'difference' | 'none';
  description: string;
}

/**
 * Calculate points for a prediction based on actual match result
 * 
 * Scoring system:
 * - 5 points: Exact score (correct home score AND away score)
 * - 3 points: Correct goal difference AND correct winner
 * - 1 point: Correct winner only
 * - 0 points: Wrong
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): PointsCalculation {
  // Exact score match
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return {
      points: 5,
      isCorrect: true,
      category: 'exact',
      description: 'Exact score! Perfect prediction'
    };
  }

  // Calculate results (win/draw/loss)
  const predictedResult = getResult(predictedHome, predictedAway);
  const actualResult = getResult(actualHome, actualAway);
  
  // Calculate goal differences
  const predictedDifference = predictedHome - predictedAway;
  const actualDifference = actualHome - actualAway;

  // Check if winner is correct
  const correctWinner = predictedResult === actualResult;

  // Check if goal difference is correct AND meaningful
  const correctGoalDifference = predictedDifference === actualDifference;
  
  // Correct goal difference AND correct winner (but not exact score)
  if (correctWinner && correctGoalDifference) {
    return {
      points: 3,
      isCorrect: true,
      category: 'difference',
      description: `Correct goal difference and winner (${actualDifference > 0 ? '+' : actualDifference === 0 ? '0' : ''}${actualDifference})`
    };
  }

  // Correct winner only
  if (correctWinner) {
    return {
      points: 1,
      isCorrect: true,
      category: 'result',
      description: `Correct winner (${getResultDescription(actualResult)})`
    };
  }

  // Completely wrong
  return {
    points: 0,
    isCorrect: false,
    category: 'none',
    description: 'No points scored'
  };
}

/**
 * Determine the result of a match (home win, away win, or draw)
 */
function getResult(homeScore: number, awayScore: number): 'home' | 'away' | 'draw' {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}

/**
 * Get human-readable description of match result
 */
function getResultDescription(result: 'home' | 'away' | 'draw'): string {
  switch (result) {
    case 'home': return 'Home win';
    case 'away': return 'Away win';
    case 'draw': return 'Draw';
  }
}

/**
 * Get emoji for points category
 */
export function getPointsEmoji(category: string): string {
  switch (category) {
    case 'exact': return '🎯';
    case 'result': return '✅';
    case 'difference': return '📊';
    default: return '❌';
  }
}

/**
 * Get color class for points display
 */
export function getPointsColor(points: number): string {
  switch (points) {
    case 5: return 'text-green-600 bg-green-100';
    case 3: return 'text-blue-600 bg-blue-100';
    case 1: return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Calculate points for multiple predictions
 */
export function calculateTotalPoints(predictions: Array<{
  predictedHome: number;
  predictedAway: number;
  actualHome: number;
  actualAway: number;
}>): {
  totalPoints: number;
  breakdown: {
    exact: number;
    result: number;
    difference: number;
    none: number;
  };
} {
  let totalPoints = 0;
  const breakdown = { exact: 0, result: 0, difference: 0, none: 0 };

  predictions.forEach(pred => {
    const calculation = calculatePoints(
      pred.predictedHome,
      pred.predictedAway,
      pred.actualHome,
      pred.actualAway
    );
    
    totalPoints += calculation.points;
    breakdown[calculation.category]++;
  });

  return { totalPoints, breakdown };
}