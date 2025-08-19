// Advanced analytics data structures and mock data

export interface PerformanceDataPoint {
  gameweek: number;
  date: string;
  points: number;
  predictions: number;
  correctPredictions: number;
  accuracyRate: number;
  rank: number;
  rankChange: number;
  bestPrediction?: {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    predicted: string;
    actual: string;
    points: number;
  };
}

export interface SeasonalTrends {
  totalGameweeks: number;
  averagePoints: number;
  averageAccuracy: number;
  bestGameweek: PerformanceDataPoint;
  worstGameweek: PerformanceDataPoint;
  longestStreak: number;
  currentStreak: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  consistencyScore: number; // 0-100
}

export interface MatchDifficulty {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  difficultyScore: number; // 0-100
  factors: {
    teamStrengthDifference: number;
    historicalUpsets: number;
    formVariance: number;
    injuriesImpact: number;
  };
  averageAccuracy: number; // How many users got it right
  yourAccuracy: boolean;
  pointsAwarded: number;
}

export interface HeadToHeadComparison {
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  matchesCompared: number;
  yourWins: number;
  theirWins: number;
  draws: number;
  yourTotalPoints: number;
  theirTotalPoints: number;
  yourAccuracy: number;
  theirAccuracy: number;
  lastEncounter: {
    gameweek: number;
    winner: 'you' | 'them' | 'draw';
    yourPoints: number;
    theirPoints: number;
  };
}

export interface PredictionInsight {
  type: 'strength' | 'weakness' | 'trend' | 'opportunity';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  data?: {
    metric: string;
    value: number | string;
    comparison?: number | string;
  };
}

// Mock performance data for the current user
export const MOCK_PERFORMANCE_DATA: PerformanceDataPoint[] = [
  {
    gameweek: 1,
    date: '2024-08-17',
    points: 12,
    predictions: 8,
    correctPredictions: 5,
    accuracyRate: 62.5,
    rank: 15,
    rankChange: 0,
    bestPrediction: {
      matchId: 'match-1',
      homeTeam: 'Arsenal',
      awayTeam: 'Wolves',
      predicted: '2-0',
      actual: '2-0',
      points: 5
    }
  },
  {
    gameweek: 2,
    date: '2024-08-24',
    points: 8,
    predictions: 10,
    correctPredictions: 3,
    accuracyRate: 30,
    rank: 18,
    rankChange: -3,
    bestPrediction: {
      matchId: 'match-11',
      homeTeam: 'Liverpool',
      awayTeam: 'Brentford',
      predicted: '3-1',
      actual: '4-1',
      points: 3
    }
  },
  {
    gameweek: 3,
    date: '2024-08-31',
    points: 22,
    predictions: 10,
    correctPredictions: 8,
    accuracyRate: 80,
    rank: 8,
    rankChange: 10,
    bestPrediction: {
      matchId: 'match-21',
      homeTeam: 'Brighton',
      awayTeam: 'Manchester United',
      predicted: '2-1',
      actual: '2-1',
      points: 5
    }
  },
  {
    gameweek: 4,
    date: '2024-09-14',
    points: 15,
    predictions: 10,
    correctPredictions: 7,
    accuracyRate: 70,
    rank: 8,
    rankChange: 0,
    bestPrediction: {
      matchId: 'match-31',
      homeTeam: 'Tottenham',
      awayTeam: 'Arsenal',
      predicted: '1-0',
      actual: '1-0',
      points: 5
    }
  }
];

// Mock match difficulty data
export const MOCK_MATCH_DIFFICULTIES: MatchDifficulty[] = [
  {
    matchId: 'match-1',
    homeTeam: 'Manchester City',
    awayTeam: 'Burnley',
    difficulty: 'easy',
    difficultyScore: 25,
    factors: {
      teamStrengthDifference: 85,
      historicalUpsets: 5,
      formVariance: 10,
      injuriesImpact: 15
    },
    averageAccuracy: 78,
    yourAccuracy: true,
    pointsAwarded: 3
  },
  {
    matchId: 'match-2',
    homeTeam: 'Brighton',
    awayTeam: 'Manchester United',
    difficulty: 'hard',
    difficultyScore: 80,
    factors: {
      teamStrengthDifference: 25,
      historicalUpsets: 45,
      formVariance: 70,
      injuriesImpact: 60
    },
    averageAccuracy: 23,
    yourAccuracy: true,
    pointsAwarded: 5
  },
  {
    matchId: 'match-3',
    homeTeam: 'Liverpool',
    awayTeam: 'Arsenal',
    difficulty: 'expert',
    difficultyScore: 95,
    factors: {
      teamStrengthDifference: 5,
      historicalUpsets: 85,
      formVariance: 90,
      injuriesImpact: 40
    },
    averageAccuracy: 12,
    yourAccuracy: false,
    pointsAwarded: 0
  }
];

// Mock head-to-head data
export const MOCK_HEAD_TO_HEAD: HeadToHeadComparison[] = [
  {
    opponentId: 'user-2',
    opponentName: 'PredictionKing92',
    opponentAvatar: '🤴',
    matchesCompared: 4,
    yourWins: 1,
    theirWins: 2,
    draws: 1,
    yourTotalPoints: 57,
    theirTotalPoints: 89,
    yourAccuracy: 62.5,
    theirAccuracy: 90,
    lastEncounter: {
      gameweek: 4,
      winner: 'them',
      yourPoints: 15,
      theirPoints: 28
    }
  },
  {
    opponentId: 'user-3',
    opponentName: 'FootyOracle',
    opponentAvatar: '🧙‍♀️',
    matchesCompared: 4,
    yourWins: 2,
    theirWins: 1,
    draws: 1,
    yourTotalPoints: 57,
    theirTotalPoints: 84,
    yourAccuracy: 62.5,
    theirAccuracy: 80,
    lastEncounter: {
      gameweek: 4,
      winner: 'you',
      yourPoints: 15,
      theirPoints: 22
    }
  },
  {
    opponentId: 'user-4',
    opponentName: 'StatsMaster',
    opponentAvatar: '📊',
    matchesCompared: 4,
    yourWins: 3,
    theirWins: 0,
    draws: 1,
    yourTotalPoints: 57,
    theirTotalPoints: 78,
    yourAccuracy: 62.5,
    theirAccuracy: 80,
    lastEncounter: {
      gameweek: 4,
      winner: 'you',
      yourPoints: 15,
      theirPoints: 18
    }
  }
];

// Calculate seasonal trends from performance data
export const calculateSeasonalTrends = (data: PerformanceDataPoint[]): SeasonalTrends => {
  if (data.length === 0) {
    return {
      totalGameweeks: 0,
      averagePoints: 0,
      averageAccuracy: 0,
      bestGameweek: {} as PerformanceDataPoint,
      worstGameweek: {} as PerformanceDataPoint,
      longestStreak: 0,
      currentStreak: 0,
      trendDirection: 'stable',
      consistencyScore: 0
    };
  }

  const totalPoints = data.reduce((sum, gw) => sum + gw.points, 0);
  const totalAccuracy = data.reduce((sum, gw) => sum + gw.accuracyRate, 0);
  const averagePoints = totalPoints / data.length;
  const averageAccuracy = totalAccuracy / data.length;

  const bestGameweek = data.reduce((best, current) => 
    current.points > best.points ? current : best
  );
  
  const worstGameweek = data.reduce((worst, current) => 
    current.points < worst.points ? current : worst
  );

  // Calculate trend direction based on last 3 gameweeks
  let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
  if (data.length >= 3) {
    const recent = data.slice(-3);
    const recentTrend = recent[2].points - recent[0].points;
    if (recentTrend > 5) trendDirection = 'improving';
    else if (recentTrend < -5) trendDirection = 'declining';
  }

  // Calculate consistency score based on variance
  const pointVariance = data.reduce((acc, gw) => acc + Math.pow(gw.points - averagePoints, 2), 0) / data.length;
  const consistencyScore = Math.max(0, Math.min(100, 100 - (pointVariance * 2)));

  // Calculate streaks (simplified for demo)
  const currentStreak = data[data.length - 1]?.correctPredictions > 0 ? 3 : 0;
  const longestStreak = 5;

  return {
    totalGameweeks: data.length,
    averagePoints: Math.round(averagePoints * 10) / 10,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    bestGameweek,
    worstGameweek,
    longestStreak,
    currentStreak,
    trendDirection,
    consistencyScore: Math.round(consistencyScore)
  };
};

// Generate insights based on performance data
export const generateInsights = (data: PerformanceDataPoint[], trends: SeasonalTrends): PredictionInsight[] => {
  const insights: PredictionInsight[] = [];

  // Accuracy trend insight
  if (trends.averageAccuracy > 70) {
    insights.push({
      type: 'strength',
      title: 'Excellent Accuracy',
      description: `Your ${trends.averageAccuracy.toFixed(1)}% accuracy rate is well above average. Keep up the great work!`,
      icon: '🎯',
      priority: 'high',
      data: {
        metric: 'Accuracy Rate',
        value: `${trends.averageAccuracy.toFixed(1)}%`,
        comparison: '70%'
      }
    });
  } else if (trends.averageAccuracy < 50) {
    insights.push({
      type: 'weakness',
      title: 'Room for Improvement',
      description: 'Your accuracy could be better. Focus on researching team form and injuries.',
      icon: '📈',
      priority: 'high',
      data: {
        metric: 'Accuracy Rate',
        value: `${trends.averageAccuracy.toFixed(1)}%`,
        comparison: '60%'
      }
    });
  }

  // Consistency insight
  if (trends.consistencyScore > 80) {
    insights.push({
      type: 'strength',
      title: 'Very Consistent',
      description: 'Your predictions are remarkably consistent across gameweeks.',
      icon: '⚖️',
      priority: 'medium',
      data: {
        metric: 'Consistency Score',
        value: trends.consistencyScore,
        comparison: 70
      }
    });
  }

  // Trend insight
  if (trends.trendDirection === 'improving') {
    insights.push({
      type: 'trend',
      title: 'Upward Trajectory',
      description: 'Your recent performance shows clear improvement. You\'re on the right track!',
      icon: '📊',
      priority: 'medium'
    });
  } else if (trends.trendDirection === 'declining') {
    insights.push({
      type: 'opportunity',
      title: 'Focus Needed',
      description: 'Recent results show a decline. Consider analyzing your prediction strategy.',
      icon: '🔍',
      priority: 'high'
    });
  }

  return insights;
};

// Helper functions for analytics
export const getDifficultyColor = (difficulty: MatchDifficulty['difficulty']) => {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'hard': return 'text-orange-600 bg-orange-100';
    case 'expert': return 'text-red-600 bg-red-100';
  }
};

export const getInsightColor = (type: PredictionInsight['type']) => {
  switch (type) {
    case 'strength': return 'text-green-600 bg-green-100 border-green-200';
    case 'weakness': return 'text-red-600 bg-red-100 border-red-200';
    case 'trend': return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'opportunity': return 'text-purple-600 bg-purple-100 border-purple-200';
  }
};