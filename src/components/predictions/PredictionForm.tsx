'use client';

import React, { useState } from 'react';
import { Match } from '@/types';
import { usePredictions } from '@/contexts/PredictionContext';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';

interface PredictionFormProps {
  match: Match;
  onSuccess?: () => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ match, onSuccess }) => {
  const { savePredictionForMatch, submitPredictions, showSuccessMessage, showErrorMessage } = usePredictions();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (team: 'home' | 'away', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      if (team === 'home') {
        setHomeScore(value);
      } else {
        setAwayScore(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (homeScore === '' || awayScore === '') {
      showErrorMessage('Please enter both home and away scores');
      return;
    }

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    if (isNaN(homeScoreNum) || isNaN(awayScoreNum) || homeScoreNum < 0 || awayScoreNum < 0) {
      showErrorMessage('Please enter valid scores (0 or greater)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save the prediction as draft first
      savePredictionForMatch(match.id, homeScoreNum, awayScoreNum, match.gameweek, match.season);
      
      showSuccessMessage(`Prediction saved for ${match.homeTeam.name} vs ${match.awayTeam.name}!`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showErrorMessage('Failed to save prediction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPredictionComplete = homeScore !== '' && awayScore !== '';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-purple-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {formatMatchDate(match.kickoff)}
          </span>
          <span className="text-gray-600">
            {formatMatchTime(match.kickoff)}
          </span>
        </div>
      </div>

      {/* Teams and Prediction */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={match.homeTeam.logo} 
                  alt={`${match.homeTeam.name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                  {match.homeTeam.name.substring(0, 3).toUpperCase()}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center max-w-24">
                {match.homeTeam.name}
              </div>
            </div>
          </div>

          {/* Prediction Inputs */}
          <div className="flex-shrink-0 mx-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                placeholder="0"
                maxLength={2}
                disabled={isSubmitting}
              />
              <div className="text-2xl font-bold text-gray-400">-</div>
              <input
                type="text"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="0"
                maxLength={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={match.awayTeam.logo} 
                  alt={`${match.awayTeam.name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                  {match.awayTeam.name.substring(0, 3).toUpperCase()}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center max-w-24">
                {match.awayTeam.name}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={!isPredictionComplete || isSubmitting}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isPredictionComplete && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Saving...' : isPredictionComplete ? 'Save Prediction' : 'Enter scores to save'}
          </button>
        </div>

        {/* Status */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="text-gray-500">
            {isPredictionComplete ? (
              <span className="text-green-600 font-medium">
                ✓ Ready to save
              </span>
            ) : (
              <span className="text-gray-400">
                Enter prediction to save
              </span>
            )}
          </div>
          <div className="text-gray-500">
            Gameweek {match.gameweek}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PredictionForm;