import { Match } from '@/types';
import { StoredPrediction } from './storage';

export interface PointsBreakdown {
  exactScore: number;
  goalDifference: number;
  correctWinner: number;
  upsetBonus: number;
  cleanSheetBonus: number;
  nilNilBonus: number;
  total: number;
  description: string[];
}

export interface ScoringRules {
  exactScore: number;
  goalDifference: number;
  correctWinner: number;
  upsetBonus: number;
  cleanSheetBonus: number;
  nilNilBonus: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  exactScore: 5,
  goalDifference: 3,
  correctWinner: 1,
  upsetBonus: 2,
  cleanSheetBonus: 1,
  nilNilBonus: 2
};

// Mock team rankings for upset bonus calculation (in a real app, this would come from API)
const TEAM_RANKINGS: { [teamId: string]: number } = {
  '1': 1,  // Manchester City
  '2': 2,  // Arsenal
  '3': 3,  // Liverpool
  '4': 4,  // Chelsea
  '5': 5,  // Newcastle United
  '6': 6,  // Manchester United
  '7': 7,  // Brighton
  '8': 8,  // Aston Villa
  '9': 9,  // Tottenham
  '10': 10, // Crystal Palace
  '11': 11, // Fulham
  '12': 12, // Brentford
  '13': 13, // West Ham
  '14': 14, // Bournemouth
  '15': 15, // Wolves
  '16': 16, // Everton
  '17': 17, // Nottingham Forest
  '18': 18, // Sheffield United
  '19': 19, // Burnley
  '20': 20  // Luton Town
};

export const calculatePoints = (
  prediction: StoredPrediction,
  actualHomeScore: number,
  actualAwayScore: number,
  match: Match,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): PointsBreakdown => {
  const breakdown: PointsBreakdown = {
    exactScore: 0,
    goalDifference: 0,
    correctWinner: 0,
    upsetBonus: 0,
    cleanSheetBonus: 0,
    nilNilBonus: 0,
    total: 0,
    description: []
  };

  const predictedHomeScore = prediction.homeScore;
  const predictedAwayScore = prediction.awayScore;

  // 1. Exact Score (5 points)
  if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
    breakdown.exactScore = rules.exactScore;
    breakdown.description.push(`Exact score: ${predictedHomeScore}-${predictedAwayScore} (+${rules.exactScore})`);
  }
  // 2. Correct Goal Difference (3 points) - only if not exact score
  else if ((predictedHomeScore - predictedAwayScore) === (actualHomeScore - actualAwayScore)) {
    breakdown.goalDifference = rules.goalDifference;
    breakdown.description.push(`Correct goal difference: ${actualHomeScore - actualAwayScore} (+${rules.goalDifference})`);
  }
  // 3. Correct Winner (1 point) - only if not exact score or goal difference
  else if (getMatchResult(predictedHomeScore, predictedAwayScore) === getMatchResult(actualHomeScore, actualAwayScore)) {
    breakdown.correctWinner = rules.correctWinner;
    const result = getMatchResult(actualHomeScore, actualAwayScore);
    breakdown.description.push(`Correct ${result}: (+${rules.correctWinner})`);
  }

  // Bonus Points (can combine with above)
  
  // 4. Upset Bonus (+2 points) - team ranked 10+ positions lower wins
  if (isUpset(match, actualHomeScore, actualAwayScore)) {
    if (predictedHomeScore > predictedAwayScore && actualHomeScore > actualAwayScore) {
      breakdown.upsetBonus = rules.upsetBonus;
      breakdown.description.push(`Upset bonus: Predicted underdog win (+${rules.upsetBonus})`);
    } else if (predictedHomeScore < predictedAwayScore && actualHomeScore < actualAwayScore) {
      breakdown.upsetBonus = rules.upsetBonus;
      breakdown.description.push(`Upset bonus: Predicted underdog win (+${rules.upsetBonus})`);
    }
  }

  // 5. Clean Sheet Bonus (+1 point) - correctly predict team gets 0 goals
  if (predictedHomeScore === 0 && actualHomeScore === 0) {
    breakdown.cleanSheetBonus = rules.cleanSheetBonus;
    breakdown.description.push(`Clean sheet bonus: ${match.homeTeam.shortName} (+${rules.cleanSheetBonus})`);
  }
  if (predictedAwayScore === 0 && actualAwayScore === 0) {
    breakdown.cleanSheetBonus += rules.cleanSheetBonus;
    breakdown.description.push(`Clean sheet bonus: ${match.awayTeam.shortName} (+${rules.cleanSheetBonus})`);
  }

  // 6. Nil-Nil Bonus (+2 points) - correctly predict 0-0 draw
  if (predictedHomeScore === 0 && predictedAwayScore === 0 && 
      actualHomeScore === 0 && actualAwayScore === 0) {
    breakdown.nilNilBonus = rules.nilNilBonus;
    breakdown.description.push(`Nil-nil bonus: Perfect 0-0 prediction (+${rules.nilNilBonus})`);
  }

  // Calculate total
  breakdown.total = breakdown.exactScore + breakdown.goalDifference + breakdown.correctWinner + 
                   breakdown.upsetBonus + breakdown.cleanSheetBonus + breakdown.nilNilBonus;

  if (breakdown.total === 0) {
    breakdown.description = ['No points: Incorrect prediction'];
  }

  return breakdown;
};

const getMatchResult = (homeScore: number, awayScore: number): 'home win' | 'away win' | 'draw' => {
  if (homeScore > awayScore) return 'home win';
  if (homeScore < awayScore) return 'away win';
  return 'draw';
};

const isUpset = (match: Match, actualHomeScore: number, actualAwayScore: number): boolean => {
  const homeRank = TEAM_RANKINGS[match.homeTeam.id] || 20;
  const awayRank = TEAM_RANKINGS[match.awayTeam.id] || 20;
  const rankDifference = Math.abs(homeRank - awayRank);

  if (rankDifference < 10) return false;

  // Home team is much lower ranked but wins
  if (homeRank - awayRank >= 10 && actualHomeScore > actualAwayScore) return true;
  
  // Away team is much lower ranked but wins  
  if (awayRank - homeRank >= 10 && actualAwayScore > actualHomeScore) return true;

  return false;
};

// Helper function to calculate total points for multiple predictions
export const calculateTotalPoints = (
  predictions: StoredPrediction[],
  matches: Match[],
  rules: ScoringRules = DEFAULT_SCORING_RULES
): number => {
  let totalPoints = 0;
  
  predictions.forEach(prediction => {
    const match = matches.find(m => m.id === prediction.matchId);
    if (match && match.homeScore !== undefined && match.awayScore !== undefined) {
      const points = calculatePoints(prediction, match.homeScore, match.awayScore, match, rules);
      totalPoints += points.total;
    }
  });
  
  return totalPoints;
};

// Helper function to get accuracy rate
export const calculateAccuracyRate = (predictions: StoredPrediction[], matches: Match[]): number => {
  const completedMatches = matches.filter(m => m.homeScore !== undefined && m.awayScore !== undefined);
  if (completedMatches.length === 0) return 0;

  let correctPredictions = 0;
  predictions.forEach(prediction => {
    const match = completedMatches.find(m => m.id === prediction.matchId);
    if (match) {
      const points = calculatePoints(prediction, match.homeScore!, match.awayScore!, match);
      if (points.total > 0) correctPredictions++;
    }
  });

  return Math.round((correctPredictions / completedMatches.length) * 100);
};