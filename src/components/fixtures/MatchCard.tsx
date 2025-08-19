'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';
import { usePredictions } from '@/contexts/PredictionContext';

interface MatchCardProps {
  match: Match;
  onPredictionChange?: (matchId: string, homeScore: number, awayScore: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPredictionChange }) => {
  const { getPrediction, savePredictionForMatch } = usePredictions();
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');

  // Load existing prediction on mount
  useEffect(() => {
    const existingPrediction = getPrediction(match.id);
    if (existingPrediction) {
      setHomeScore(existingPrediction.homeScore.toString());
      setAwayScore(existingPrediction.awayScore.toString());
    }
  }, [match.id, getPrediction]);

  const handleScoreChange = (team: 'home' | 'away', value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      if (team === 'home') {
        setHomeScore(value);
        if (value !== '' && awayScore !== '') {
          const homeScoreNum = parseInt(value);
          const awayScoreNum = parseInt(awayScore);
          savePredictionForMatch(match.id, homeScoreNum, awayScoreNum, match.gameweek, match.season);
          onPredictionChange?.(match.id, homeScoreNum, awayScoreNum);
        }
      } else {
        setAwayScore(value);
        if (homeScore !== '' && value !== '') {
          const homeScoreNum = parseInt(homeScore);
          const awayScoreNum = parseInt(value);
          savePredictionForMatch(match.id, homeScoreNum, awayScoreNum, match.gameweek, match.season);
          onPredictionChange?.(match.id, homeScoreNum, awayScoreNum);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Match Date/Time Header */}
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

      {/* Teams and Score Prediction */}
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
                    // Fallback if image fails to load
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

          {/* Score Prediction Inputs */}
          <div className="flex-shrink-0 mx-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                placeholder="0"
                maxLength={2}
              />
              <div className="text-2xl font-bold text-gray-400">-</div>
              <input
                type="text"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="0"
                maxLength={2}
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
                    // Fallback if image fails to load
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

        {/* Prediction Status */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              {homeScore !== '' && awayScore !== '' ? (
                <span className="text-green-600 font-medium">
                  ✓ Prediction saved
                </span>
              ) : (
                <span className="text-gray-400">
                  Enter your prediction
                </span>
              )}
            </div>
            <div className="text-gray-500">
              Gameweek {match.gameweek}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;