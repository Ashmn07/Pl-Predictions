'use client';

import React, { useState, useEffect } from 'react';
import { useDatabasePredictions } from '@/contexts/DatabasePredictionContext';
import { PredictionType } from '@prisma/client';

interface DatabaseMatchCardProps {
  fixture: any; // Database fixture with nested teams and user predictions
}

const DatabaseMatchCard: React.FC<DatabaseMatchCardProps> = ({ fixture }) => {
  const { savePrediction, getPrediction } = useDatabasePredictions();
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType | null>(null);
  const [confidence, setConfidence] = useState(80);
  const [isLoading, setIsLoading] = useState(false);

  // Get existing prediction for this fixture
  const existingPrediction = getPrediction(fixture.id);

  // Load existing prediction on mount
  useEffect(() => {
    if (existingPrediction) {
      setSelectedPrediction(existingPrediction.prediction);
      setConfidence(existingPrediction.confidence);
    }
  }, [existingPrediction]);

  const handlePredictionChange = async (prediction: PredictionType) => {
    setIsLoading(true);
    try {
      await savePrediction(fixture.id, prediction, confidence);
      setSelectedPrediction(prediction);
    } catch (error) {
      console.error('Failed to save prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfidenceChange = async (newConfidence: number) => {
    if (selectedPrediction) {
      setIsLoading(true);
      try {
        await savePrediction(fixture.id, selectedPrediction, newConfidence);
        setConfidence(newConfidence);
      } catch (error) {
        console.error('Failed to update confidence:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setConfidence(newConfidence);
    }
  };

  const formatDate = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (kickoffTime: string) => {
    const date = new Date(kickoffTime);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = () => {
    if (existingPrediction?.isSubmitted) return 'text-green-600';
    if (existingPrediction && !existingPrediction.isSubmitted) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (existingPrediction?.isSubmitted) return '✓ Submitted';
    if (existingPrediction && !existingPrediction.isSubmitted) return '📝 Draft saved';
    return 'Make prediction';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Match Date/Time Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-purple-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {formatDate(fixture.kickoffTime)}
          </span>
          <span className="text-gray-600">
            {formatTime(fixture.kickoffTime)}
          </span>
        </div>
      </div>

      {/* Teams and Prediction */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8">
                <img 
                  src={fixture.homeTeam.logoUrl} 
                  alt={fixture.homeTeam.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-2xl">⚽</div>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {fixture.homeTeam.shortName}
              </div>
              <div className="text-xs text-gray-600 text-center max-w-20">
                {fixture.homeTeam.name}
              </div>
            </div>
          </div>

          {/* Prediction Buttons */}
          <div className="flex-shrink-0 mx-4">
            <div className="flex flex-col space-y-2">
              {/* Home Win */}
              <button
                onClick={() => handlePredictionChange('HOME_WIN')}
                disabled={isLoading || fixture.status !== 'SCHEDULED'}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPrediction === 'HOME_WIN'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Home Win
              </button>
              
              {/* Draw */}
              <button
                onClick={() => handlePredictionChange('DRAW')}
                disabled={isLoading || fixture.status !== 'SCHEDULED'}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPrediction === 'DRAW'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Draw
              </button>
              
              {/* Away Win */}
              <button
                onClick={() => handlePredictionChange('AWAY_WIN')}
                disabled={isLoading || fixture.status !== 'SCHEDULED'}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPrediction === 'AWAY_WIN'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Away Win
              </button>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8">
                <img 
                  src={fixture.awayTeam.logoUrl} 
                  alt={fixture.awayTeam.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-2xl">⚽</div>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {fixture.awayTeam.shortName}
              </div>
              <div className="text-xs text-gray-600 text-center max-w-20">
                {fixture.awayTeam.name}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Slider */}
        {selectedPrediction && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-600 w-16">Confidence:</span>
              <input
                type="range"
                min="50"
                max="100"
                value={confidence}
                onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                disabled={isLoading || fixture.status !== 'SCHEDULED'}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-900 w-8">{confidence}%</span>
            </div>
          </div>
        )}

        {/* Prediction Status */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className={`font-medium ${getStatusColor()}`}>
              {isLoading ? '⏳ Saving...' : getStatusText()}
            </div>
            <div className="text-gray-500">
              Gameweek {fixture.gameweek}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMatchCard;