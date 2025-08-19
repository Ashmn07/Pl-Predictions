// Storage utilities for prediction data

const STORAGE_KEYS = {
  PREDICTIONS: 'pl-predictions',
  USER_STATS: 'pl-user-stats'
} as const;

export interface UserStats {
  totalPoints: number;
  currentRank: number;
  predictionsMade: number;
  accuracyRate: number;
  lastUpdated: string;
}

export interface StoredPrediction {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  submittedAt: string;
  gameweek: number;
  season: string;
  status: 'draft' | 'submitted';
}

// Prediction storage functions
export const savePredictions = (predictions: StoredPrediction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(predictions));
  } catch (error) {
    console.error('Failed to save predictions:', error);
  }
};

export const loadPredictions = (): StoredPrediction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load predictions:', error);
    return [];
  }
};

export const savePrediction = (prediction: StoredPrediction): void => {
  const predictions = loadPredictions();
  const existingIndex = predictions.findIndex(p => p.matchId === prediction.matchId);
  
  if (existingIndex >= 0) {
    predictions[existingIndex] = prediction;
  } else {
    predictions.push(prediction);
  }
  
  savePredictions(predictions);
};

export const getPredictionForMatch = (matchId: string): StoredPrediction | null => {
  const predictions = loadPredictions();
  return predictions.find(p => p.matchId === matchId) || null;
};

export const getPredictionsByGameweek = (gameweek: number, season: string): StoredPrediction[] => {
  const predictions = loadPredictions();
  return predictions.filter(p => p.gameweek === gameweek && p.season === season);
};

export const submitPredictions = (matchIds: string[]): boolean => {
  try {
    const predictions = loadPredictions();
    const updated = predictions.map(p => 
      matchIds.includes(p.matchId) 
        ? { ...p, status: 'submitted' as const, submittedAt: new Date().toISOString() }
        : p
    );
    savePredictions(updated);
    return true;
  } catch (error) {
    console.error('Failed to submit predictions:', error);
    return false;
  }
};

// User stats functions
export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save user stats:', error);
  }
};

export const loadUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return stored ? JSON.parse(stored) : {
      totalPoints: 0,
      currentRank: 0,
      predictionsMade: 0,
      accuracyRate: 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to load user stats:', error);
    return {
      totalPoints: 0,
      currentRank: 0,
      predictionsMade: 0,
      accuracyRate: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Clear all data (for development/testing)
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREDICTIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_STATS);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};