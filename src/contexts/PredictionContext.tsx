'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  StoredPrediction, 
  UserStats
} from '@/lib/storage';
import { useSession } from 'next-auth/react';

interface PredictionContextType {
  predictions: StoredPrediction[];
  userStats: UserStats;
  isLoading: boolean;
  
  // Prediction actions
  savePredictionForMatch: (matchId: string, homeScore: number, awayScore: number, gameweek: number, season: string) => void;
  submitPredictions: (matchIds: string[]) => Promise<boolean>;
  getPrediction: (matchId: string) => StoredPrediction | null;
  getPredictionsByGW: (gameweek: number, season: string) => StoredPrediction[];
  
  // Stats actions
  updateUserStats: (stats: Partial<UserStats>) => void;
  refreshStats: () => void;
  
  // UI state
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  successMessage: string | null;
  errorMessage: string | null;
  clearMessages: () => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    currentRank: 0,
    predictionsMade: 0,
    accuracyRate: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: session } = useSession();

  // Load data from database on mount
  useEffect(() => {
    loadPredictions();
    loadUserStatsFromDB();
  }, [session]);

  const loadUserStatsFromDB = useCallback(async () => {
    if (!session?.user?.email) {
      // For non-authenticated users, keep default stats
      setUserStats({
        totalPoints: 0,
        currentRank: 0,
        predictionsMade: 0,
        accuracyRate: 0,
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    try {
      const response = await fetch('/api/leaderboard?limit=100');
      const users = await response.json();
      
      if (Array.isArray(users)) {
        const currentUser = users.find(u => u.username === session.user?.email?.split('@')[0]);
        
        if (currentUser) {
          setUserStats({
            totalPoints: currentUser.totalPoints || 0,
            currentRank: currentUser.currentRank || currentUser.rank || 0,
            predictionsMade: currentUser.totalPredictions || 0,
            accuracyRate: Math.round(currentUser.accuracyRate || 0),
            lastUpdated: new Date().toISOString()
          });
        } else {
          // User exists but not in leaderboard yet
          setUserStats({
            totalPoints: 0,
            currentRank: 0,
            predictionsMade: 0,
            accuracyRate: 0,
            lastUpdated: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Keep default stats on error
    }
  }, [session]);

  const loadPredictions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/predictions');
      const data = await response.json();
      
      if (data.success) {
        // Convert database predictions to StoredPrediction format
        const convertedPredictions: StoredPrediction[] = data.predictions.map((p: {
          id: string;
          fixtureId: string;
          homeScore: number;
          awayScore: number;
          createdAt: string;
          isSubmitted: boolean;
        }) => ({
          id: p.id,
          matchId: p.fixtureId,
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          submittedAt: p.createdAt,
          gameweek: 1, // Will be added later
          season: '2025-26',
          status: p.isSubmitted ? 'submitted' : 'draft'
        }));
        
        setPredictions(convertedPredictions);
      } else {
        setErrorMessage('Failed to load your predictions. Please refresh the page.');
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setErrorMessage('Failed to load your predictions. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePredictionForMatch = useCallback(async (
    matchId: string, 
    homeScore: number, 
    awayScore: number, 
    gameweek: number, 
    season: string
  ) => {
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureId: matchId,
          homeScore,
          awayScore,
          gameweek,
          season,
          isSubmitted: false
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Convert database prediction to StoredPrediction format
        const newPrediction: StoredPrediction = {
          id: data.prediction.id,
          matchId: data.prediction.fixtureId,
          homeScore: data.prediction.homeScore,
          awayScore: data.prediction.awayScore,
          submittedAt: data.prediction.createdAt,
          gameweek: gameweek,
          season: season,
          status: data.prediction.isSubmitted ? 'submitted' : 'draft'
        };

        // Update local state
        setPredictions(prev => {
          const filtered = prev.filter(p => p.matchId !== matchId);
          return [...filtered, newPrediction];
        });

        // Update prediction count in stats
        const currentGameweekPredictions = predictions.filter(p => p.gameweek === gameweek && p.season === season);
        const predictionCount = currentGameweekPredictions.length + (currentGameweekPredictions.find(p => p.matchId === matchId) ? 0 : 1);
        setUserStats(prev => ({
          ...prev,
          predictionsMade: predictionCount,
          lastUpdated: new Date().toISOString()
        }));
      } else {
        setErrorMessage(data.error || 'Failed to save prediction. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save prediction:', error);
      setErrorMessage('Failed to save prediction. Please try again.');
    }
  }, [predictions, userStats]);

  const submitPredictionsHandler = useCallback(async (matchIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/predictions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureIds: matchIds
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPredictions(prev => prev.map(p => 
          matchIds.includes(p.matchId) 
            ? { ...p, status: 'submitted' as const, submittedAt: new Date().toISOString() }
            : p
        ));
        
        setSuccessMessage(`Successfully submitted ${matchIds.length} prediction${matchIds.length !== 1 ? 's' : ''}!`);
        return true;
      } else {
        setErrorMessage(data.error || 'Failed to submit predictions. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Failed to submit predictions:', error);
      setErrorMessage('Failed to submit predictions. Please try again.');
      return false;
    }
  }, []);

  const getPrediction = useCallback((matchId: string): StoredPrediction | null => {
    return predictions.find(p => p.matchId === matchId) || null;
  }, [predictions]);

  const getPredictionsByGW = useCallback((gameweek: number, season: string): StoredPrediction[] => {
    return predictions.filter(p => p.gameweek === gameweek && p.season === season);
  }, [predictions]);

  const updateUserStats = useCallback((newStats: Partial<UserStats>) => {
    setUserStats(prev => ({
      ...prev,
      ...newStats,
      lastUpdated: new Date().toISOString()
    }));
    // Note: Real stats are now loaded from database, not localStorage
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      await loadPredictions();
      await loadUserStatsFromDB();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      setErrorMessage('Failed to refresh data. Please try again.');
    }
  }, [loadPredictions, loadUserStatsFromDB]);

  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    // Auto-clear after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  }, []);

  const showErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    // Auto-clear after 5 seconds
    setTimeout(() => setErrorMessage(null), 5000);
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const value: PredictionContextType = {
    predictions,
    userStats,
    isLoading,
    savePredictionForMatch,
    submitPredictions: submitPredictionsHandler,
    getPrediction,
    getPredictionsByGW,
    updateUserStats,
    refreshStats,
    showSuccessMessage,
    showErrorMessage,
    successMessage,
    errorMessage,
    clearMessages
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictions = (): PredictionContextType => {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error('usePredictions must be used within a PredictionProvider');
  }
  return context;
};