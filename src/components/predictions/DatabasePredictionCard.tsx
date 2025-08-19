'use client';

import React from 'react';
import { DatabasePrediction } from '@/lib/prediction-service';

interface DatabasePredictionCardProps {
  prediction: DatabasePrediction;
}

const DatabasePredictionCard: React.FC<DatabasePredictionCardProps> = ({ prediction }) => {
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

  const getPredictionText = () => {
    switch (prediction.prediction) {
      case 'HOME_WIN':
        return 'Home Win';
      case 'AWAY_WIN':
        return 'Away Win';
      case 'DRAW':
        return 'Draw';
      default:
        return prediction.prediction;
    }
  };

  const getPredictionColor = () => {
    switch (prediction.prediction) {
      case 'HOME_WIN':
        return 'bg-green-100 text-green-800';
      case 'AWAY_WIN':
        return 'bg-purple-100 text-purple-800';
      case 'DRAW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = () => {
    if (prediction.isSubmitted) return 'text-green-600';
    return 'text-blue-600';
  };

  const getStatusText = () => {
    if (prediction.isSubmitted) return '✓ Submitted';
    return '📝 Draft';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header with Match Info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-purple-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {formatDate(prediction.fixture.kickoffTime)}
          </span>
          <span className="text-gray-600">
            {formatTime(prediction.fixture.kickoffTime)}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8">
              <img 
                src={prediction.fixture.homeTeam.logoUrl} 
                alt={prediction.fixture.homeTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden text-2xl">⚽</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {prediction.fixture.homeTeam.name}
              </div>
              <div className="text-sm text-gray-600">
                Home
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-gray-400 font-bold text-lg">
            VS
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-semibold text-gray-900 text-right">
                {prediction.fixture.awayTeam.name}
              </div>
              <div className="text-sm text-gray-600 text-right">
                Away
              </div>
            </div>
            <div className="w-8 h-8">
              <img 
                src={prediction.fixture.awayTeam.logoUrl} 
                alt={prediction.fixture.awayTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden text-2xl">⚽</div>
            </div>
          </div>
        </div>

        {/* Prediction Details */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Your Prediction:</div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor()}`}>
                {getPredictionText()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Confidence:</div>
              <div className="text-lg font-bold text-gray-900">
                {prediction.confidence}%
              </div>
            </div>
          </div>

          {/* Match Result (if available) */}
          {prediction.fixture.homeScore !== null && prediction.fixture.awayScore !== null && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Final Score:</div>
                <div className="font-bold text-gray-900">
                  {prediction.fixture.homeScore} - {prediction.fixture.awayScore}
                </div>
              </div>
              {/* TODO: Add points scored display when available */}
            </div>
          )}
        </div>

        {/* Status and Meta */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <div className="text-gray-500">
              Gameweek {prediction.fixture.gameweek}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Created: {new Date(prediction.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePredictionCard;