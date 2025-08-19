'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types';
import { usePredictions } from '@/contexts/PredictionContext';
import MatchCard from './MatchCard';

interface FixturesGridProps {
  fixtures: Match[];
  gameweek: number;
}

interface PredictionState {
  [matchId: string]: {
    homeScore: number;
    awayScore: number;
  };
}

const FixturesGrid: React.FC<FixturesGridProps> = ({ fixtures, gameweek }) => {
  const { getPredictionsByGW, submitPredictions, showSuccessMessage, showErrorMessage } = usePredictions();
  const [predictions, setPredictions] = useState<PredictionState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing predictions on mount
  useEffect(() => {
    const existingPredictions = getPredictionsByGW(gameweek, '2025-26');
    const predictionState: PredictionState = {};
    existingPredictions.forEach(p => {
      predictionState[p.matchId] = { homeScore: p.homeScore, awayScore: p.awayScore };
    });
    setPredictions(predictionState);
  }, [getPredictionsByGW, gameweek]);

  const handlePredictionChange = (matchId: string, homeScore: number, awayScore: number) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: { homeScore, awayScore }
    }));
  };

  const handleSubmitPredictions = async () => {
    if (Object.keys(predictions).length !== totalMatches) {
      showErrorMessage(`Please complete all ${totalMatches} predictions before submitting.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const matchIds = Object.keys(predictions);
      const success = await submitPredictions(matchIds);
      if (success) {
        showSuccessMessage(`Successfully submitted ${matchIds.length} predictions!`);
      }
    } catch {
      showErrorMessage('Failed to submit predictions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const predictionCount = Object.keys(predictions).length;
  const totalMatches = fixtures.length;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Gameweek {gameweek} Fixtures
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Make your predictions for this gameweek
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {predictionCount}/{totalMatches}
            </div>
            <div className="text-xs text-gray-500">
              predictions made
            </div>
            {/* Progress bar */}
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(predictionCount / totalMatches) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fixtures.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onPredictionChange={handlePredictionChange}
          />
        ))}
      </div>

      {/* Submit Section */}
      {predictionCount === totalMatches && totalMatches > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 All predictions complete!
            </h3>
            <p className="text-gray-600 mb-4">
              You have completed all {totalMatches} predictions for this gameweek. Ready to submit?
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={handleSubmitPredictions}
                disabled={isSubmitting || predictionCount === 0}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Predictions'}
              </button>
              <button 
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={() => showSuccessMessage('Predictions saved as draft!')}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixturesGrid;