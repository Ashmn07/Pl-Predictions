'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { predictionService, DatabasePrediction, DatabaseUserStats } from '@/lib/prediction-service';
import { PredictionType } from '@prisma/client';

interface DatabasePredictionContextType {
  predictions: DatabasePrediction[];
  userStats: DatabaseUserStats | null;
  fixtures: any[];
  isLoading: boolean;
  
  // Prediction actions
  savePrediction: (fixtureId: string, prediction: PredictionType, confidence: number) => Promise<void>;
  submitPredictions: (fixtureIds: string[]) => Promise<boolean>;
  getPrediction: (fixtureId: string) => DatabasePrediction | null;
  
  // Data loading
  loadFixtures: (gameweek?: number, season?: string) => Promise<void>;
  loadPredictions: (gameweek?: number, season?: string) => Promise<void>;
  loadUserStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // UI state
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  successMessage: string | null;
  errorMessage: string | null;
  clearMessages: () => void;
}

const DatabasePredictionContext = createContext<DatabasePredictionContextType | undefined>(undefined);

export const DatabasePredictionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [predictions, setPredictions] = useState<DatabasePrediction[]>([]);
  const [userStats, setUserStats] = useState<DatabaseUserStats | null>(null);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
  }, []);

  const showErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  // Load fixtures with user predictions
  const loadFixtures = useCallback(async (gameweek?: number, season: string = '2025-26') => {
    console.log('📥 loadFixtures called with:', { gameweek, season, status, userId: session?.user?.id });
    
    if (status !== 'authenticated' || !session?.user?.id) {
      console.log('❌ Cannot load fixtures: not authenticated or no user ID');
      return;
    }
    
    try {
      console.log(`📥 Loading fixtures for gameweek ${gameweek || 'all'}, season ${season}`);
      console.log('🔐 Session info:', { 
        status, 
        userId: session?.user?.id, 
        email: session?.user?.email,
        name: session?.user?.name 
      });
      
      const fixturesData = await predictionService.getFixtures(gameweek, season);
      setFixtures(fixturesData);
      console.log(`✅ Loaded ${fixturesData.length} fixtures`);
    } catch (error) {
      console.error('❌ Error loading fixtures:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorMessage(`Failed to load fixtures: ${errorMessage}`);
    }
  }, [status, session?.user?.id, showErrorMessage]);

  // Load user predictions
  const loadPredictions = useCallback(async (gameweek?: number, season: string = '2025-26') => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    
    try {
      console.log(`📥 Loading predictions for gameweek ${gameweek || 'all'}, season ${season}`);
      const predictionsData = gameweek 
        ? await predictionService.getPredictionsByGameweek(gameweek, season)
        : await predictionService.getAllPredictions();
      setPredictions(predictionsData);
      console.log(`✅ Loaded ${predictionsData.length} predictions`);
    } catch (error) {
      console.error('❌ Error loading predictions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorMessage(`Failed to load predictions: ${errorMessage}`);
    }
  }, [status, session?.user?.id, showErrorMessage]);

  // Load user stats
  const loadUserStats = useCallback(async () => {
    console.log('📊 loadUserStats called with:', { status, userId: session?.user?.id });
    
    if (status !== 'authenticated' || !session?.user?.id) {
      console.log('❌ Cannot load user stats: not authenticated or no user ID');
      return;
    }
    
    try {
      console.log('📊 Loading user stats...');
      const stats = await predictionService.getUserStats();
      setUserStats(stats);
      console.log('✅ Loaded user stats:', stats);
    } catch (error) {
      console.error('❌ Error loading user stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showErrorMessage(`Failed to load user stats: ${errorMessage}`);
    }
  }, [status, session?.user?.id, showErrorMessage]);

  // Save a prediction
  const savePrediction = useCallback(async (
    fixtureId: string, 
    prediction: PredictionType, 
    confidence: number = 80
  ) => {
    if (status !== 'authenticated' || !session?.user?.id) {
      showErrorMessage('You must be logged in to save predictions');
      return;
    }

    try {
      console.log(`💾 Saving prediction for fixture ${fixtureId}: ${prediction} (${confidence}% confidence)`);
      const savedPrediction = await predictionService.savePrediction(fixtureId, prediction, confidence);
      
      // Update local state
      setPredictions(prev => {
        const existingIndex = prev.findIndex(p => p.fixtureId === fixtureId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedPrediction;
          return updated;
        } else {
          return [...prev, savedPrediction];
        }
      });

      console.log('✅ Prediction saved successfully');
      showSuccessMessage('Prediction saved!');
    } catch (error) {
      console.error('❌ Error saving prediction:', error);
      showErrorMessage('Failed to save prediction');
      throw error;
    }
  }, [status, session?.user?.id, showSuccessMessage, showErrorMessage]);

  // Submit predictions
  const submitPredictions = useCallback(async (fixtureIds: string[]): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user?.id) {
      showErrorMessage('You must be logged in to submit predictions');
      return false;
    }

    try {
      console.log(`📤 Submitting ${fixtureIds.length} predictions`);
      const success = await predictionService.submitPredictions(fixtureIds);
      
      if (success) {
        // Update local state to mark predictions as submitted
        setPredictions(prev => prev.map(p => 
          fixtureIds.includes(p.fixtureId) 
            ? { ...p, isSubmitted: true, updatedAt: new Date().toISOString() }
            : p
        ));
        
        showSuccessMessage(`Successfully submitted ${fixtureIds.length} predictions!`);
        return true;
      } else {
        showErrorMessage('Failed to submit predictions');
        return false;
      }
    } catch (error) {
      console.error('❌ Error submitting predictions:', error);
      showErrorMessage('Failed to submit predictions');
      return false;
    }
  }, [status, session?.user?.id, showSuccessMessage, showErrorMessage]);

  // Get a specific prediction
  const getPrediction = useCallback((fixtureId: string): DatabasePrediction | null => {
    return predictions.find(p => p.fixtureId === fixtureId) || null;
  }, [predictions]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadFixtures(),
        loadPredictions(), 
        loadUserStats()
      ]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, loadFixtures, loadPredictions, loadUserStats]);

  // Initialize data when user is authenticated
  useEffect(() => {
    console.log('🔄 DatabasePredictionContext: Session status changed:', { status, userId: session?.user?.id });
    
    if (status === 'authenticated') {
      console.log('✅ User authenticated, refreshing all data...');
      refreshAll();
    } else if (status === 'unauthenticated') {
      console.log('❌ User unauthenticated, resetting state...');
      // Reset state when unauthenticated
      setPredictions([]);
      setUserStats(null);
      setFixtures([]);
      setIsLoading(false);
    } else if (status === 'loading') {
      console.log('⏳ Session loading...');
      setIsLoading(true);
    }
  }, [status, refreshAll]);

  const contextValue: DatabasePredictionContextType = {
    predictions,
    userStats,
    fixtures,
    isLoading,
    savePrediction,
    submitPredictions,
    getPrediction,
    loadFixtures,
    loadPredictions,
    loadUserStats,
    refreshAll,
    showSuccessMessage,
    showErrorMessage,
    successMessage,
    errorMessage,
    clearMessages,
  };

  return (
    <DatabasePredictionContext.Provider value={contextValue}>
      {children}
    </DatabasePredictionContext.Provider>
  );
};

export const useDatabasePredictions = () => {
  const context = useContext(DatabasePredictionContext);
  if (!context) {
    throw new Error('useDatabasePredictions must be used within a DatabasePredictionProvider');
  }
  return context;
};

export default DatabasePredictionProvider;