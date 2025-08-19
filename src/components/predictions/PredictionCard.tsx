'use client';

import React, { useState } from 'react';
import { StoredPrediction } from '@/lib/storage';
import { Match } from '@/types';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';
import { usePredictions } from '@/contexts/PredictionContext';

interface PredictionCardProps {
  prediction: StoredPrediction;
  match: Match;
  onPredictionUpdate?: () => void;
  isLocked?: boolean;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, match, onPredictionUpdate, isLocked = false }) => {
  const { showSuccessMessage, showErrorMessage } = usePredictions();
  const [isEditing, setIsEditing] = useState(false);
  const [homeScore, setHomeScore] = useState(prediction.homeScore.toString());
  const [awayScore, setAwayScore] = useState(prediction.awayScore.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHomeScore(prediction.homeScore.toString());
    setAwayScore(prediction.awayScore.toString());
  };

  const handleSave = async () => {
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

    setIsSaving(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureId: match.id,
          homeScore: homeScoreNum,
          awayScore: awayScoreNum,
          gameweek: prediction.gameweek,
          season: prediction.season,
          isSubmitted: true // Keep as submitted since it was already submitted
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the current prediction object directly
        Object.assign(prediction, {
          homeScore: homeScoreNum,
          awayScore: awayScoreNum,
          submittedAt: new Date().toISOString()
        });
        
        // Trigger parent refresh to reload data
        if (onPredictionUpdate) {
          onPredictionUpdate();
        }
        
        setIsEditing(false);
        showSuccessMessage('Prediction updated successfully!');
      } else {
        showErrorMessage(data.error || 'Failed to update prediction');
      }
    } catch (error) {
      console.error('Failed to update prediction:', error);
      showErrorMessage('Failed to update prediction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScoreChange = (team: 'home' | 'away', value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      if (team === 'home') {
        setHomeScore(value);
      } else {
        setAwayScore(value);
      }
    }
  };

  // Check if match has started (disable editing for live/finished matches) or if gameweek is locked
  const matchStarted = match.status === 'LIVE' || match.status === 'FINISHED';
  const canEdit = !matchStarted && !isLocked;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-purple-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {formatMatchDate(match.kickoff)} • {formatMatchTime(match.kickoff)}
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Submitted
          </span>
        </div>
      </div>

      {/* Match Info */}
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

          {/* Predicted Score */}
          <div className="flex-shrink-0 mx-6">
            <div className="text-center">
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={homeScore}
                    onChange={(e) => handleScoreChange('home', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="0"
                    maxLength={2}
                  />
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <input
                    type="text"
                    value={awayScore}
                    onChange={(e) => handleScoreChange('away', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="0"
                    maxLength={2}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 text-green-800 rounded-lg flex items-center justify-center text-lg font-bold">
                    {prediction.homeScore}
                  </div>
                  <div className="text-xl font-bold text-gray-400">-</div>
                  <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center text-lg font-bold">
                    {prediction.awayScore}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Your prediction
              </div>
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


        {/* Edit Mode Controls */}
        {canEdit && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            {isEditing ? (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center text-sm text-blue-800">
                    <span className="mr-2">✏️</span>
                    <span className="font-medium">Edit Mode Active</span>
                    <span className="ml-2 text-blue-600">- Modify scores above then save</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✏️ Edit Prediction
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status indicator for started matches or locked gameweek */}
        {(matchStarted || isLocked) && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {isLocked ? '🔒 Gameweek locked - editing disabled' : '🚫 Match started - editing disabled'}
              </span>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>Gameweek {prediction.gameweek}</div>
            <div>
              Submitted {new Date(prediction.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;