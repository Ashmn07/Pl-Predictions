'use client';

import React, { useState, useEffect } from 'react';
import { usePredictions } from '@/contexts/PredictionContext';
import { Match } from '@/types';
import PredictionCard from '@/components/predictions/PredictionCard';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';
import { isGameweekLocked, getGameweekLockTime, formatTimeUntilLock, getCurrentGameweek } from '@/lib/gameweek-utils';
import { LiveScoresSummary, LiveBadge } from '@/components/live/LiveMatchIndicator';

export default function Predictions() {
  const { isLoading, getPredictionsByGW, savePredictionForMatch, submitPredictions, showSuccessMessage, showErrorMessage } = usePredictions();
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store predictions locally for the gameweek
  const [gameweekPredictions, setGameweekPredictions] = useState<{[matchId: string]: {homeScore: string, awayScore: string}}>({});

  // Fetch all fixtures for the season to match with predictions
  useEffect(() => {
    async function fetchAllFixtures() {
      try {
        setFixturesLoading(true);
        const response = await fetch(`/api/fixtures?season=2025-26`);
        const data = await response.json();
        
        if (data.success && data.fixtures) {
          setFixtures(data.fixtures);
          
          // Set the default gameweek to the current/upcoming one
          const currentGW = getCurrentGameweek(data.fixtures);
          setSelectedGameweek(currentGW);
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setFixturesLoading(false);
      }
    }

    fetchAllFixtures();
  }, []);

  const handlePredictionUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading || fixturesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">
          {isLoading ? 'Loading predictions...' : 'Loading fixtures...'}
        </span>
      </div>
    );
  }

  // Get fixtures for selected gameweek
  const gameweekFixtures = fixtures.filter(f => f.gameweek === selectedGameweek && f.status === 'SCHEDULED');
  
  // Check if gameweek is locked
  const isLocked = isGameweekLocked(fixtures, selectedGameweek);
  const lockTime = getGameweekLockTime(fixtures, selectedGameweek);
  
  // Get existing predictions for selected gameweek
  const existingPredictions = getPredictionsByGW(selectedGameweek, '2025-26');
  const submittedPredictions = existingPredictions.filter(p => p.status === 'submitted');
  const draftPredictions = existingPredictions.filter(p => p.status === 'draft');
  
  // Get fixtures that don't have any predictions yet
  const unpredictedFixtures = gameweekFixtures.filter(fixture => 
    !existingPredictions.some(p => p.matchId === fixture.id)
  );

  // Check if all predictions are filled (either submitted or have BOTH scores filled locally)
  const allPredictionsFilled = gameweekFixtures.length > 0 && gameweekFixtures.every(fixture => {
    const hasExistingPrediction = existingPredictions.some(p => p.matchId === fixture.id);
    const localPrediction = gameweekPredictions[fixture.id];
    const hasBothScores = localPrediction && 
      localPrediction.homeScore !== '' && localPrediction.homeScore !== undefined &&
      localPrediction.awayScore !== '' && localPrediction.awayScore !== undefined;
    return hasExistingPrediction || hasBothScores;
  });

  // Count of total predictions needed vs filled (only count complete predictions)
  const totalMatches = gameweekFixtures.length;
  const completeLocalPredictions = Object.values(gameweekPredictions).filter(p => 
    p.homeScore !== '' && p.homeScore !== undefined && 
    p.awayScore !== '' && p.awayScore !== undefined
  ).length;
  const filledPredictions = existingPredictions.length + completeLocalPredictions;

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setGameweekPredictions(prev => {
        const currentPrediction = prev[matchId] || { homeScore: '', awayScore: '' };
        const updatedPrediction = {
          ...currentPrediction,
          [team === 'home' ? 'homeScore' : 'awayScore']: value
        };
        
        return {
          ...prev,
          [matchId]: updatedPrediction
        };
      });
    }
  };

  const handleSubmitAll = async () => {
    if (!allPredictionsFilled) return;

    setIsSubmitting(true);
    try {
      // First save all local predictions as drafts (only complete ones)
      const completeLocalPredictions = Object.entries(gameweekPredictions).filter(([_, prediction]) => 
        prediction.homeScore !== '' && prediction.homeScore !== undefined &&
        prediction.awayScore !== '' && prediction.awayScore !== undefined
      );
      
      const savePromises = completeLocalPredictions.map(([matchId, prediction]) => {
        const homeScore = parseInt(prediction.homeScore);
        const awayScore = parseInt(prediction.awayScore);
        return savePredictionForMatch(matchId, homeScore, awayScore, selectedGameweek, '2025-26');
      });
      
      await Promise.all(savePromises);
      
      // Wait a moment for the context to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get all match IDs for this gameweek (including newly saved ones)
      const allMatchIds = gameweekFixtures.map(f => f.id);
      
      // Submit all predictions
      const success = await submitPredictions(allMatchIds);
      
      if (success) {
        // Clear local predictions
        setGameweekPredictions({});
        handlePredictionUpdate();
      }
    } catch (error) {
      showErrorMessage('Failed to submit predictions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Predictions</h1>
        <p className="mt-2 text-gray-600">
          {isLocked 
            ? 'Predictions are locked for this gameweek'
            : 'Fill out all predictions for the gameweek, then submit them all at once'
          }
        </p>
      </div>

      {/* Live Scores Summary */}
      <LiveScoresSummary />

      {/* Lock Warning */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 font-medium">🔒 Predictions Locked</span>
            <span className="text-red-700 text-sm">
              This gameweek is locked. Predictions cannot be edited or submitted.
            </span>
          </div>
        </div>
      )}

      {/* Lock Timer */}
      {!isLocked && lockTime && new Date() < lockTime && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 font-medium">⏰ Time Remaining</span>
              <span className="text-yellow-700 text-sm">
                Predictions lock in {formatTimeUntilLock(lockTime)}
              </span>
            </div>
            <span className="text-xs text-yellow-600">
              Locks 1 hour before first match
            </span>
          </div>
        </div>
      )}

      {/* Gameweek Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Prediction Manager</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLocked 
                ? 'View your predictions for this gameweek'
                : 'Select gameweek and make all your predictions'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <label htmlFor="gameweek-select" className="text-sm font-medium text-gray-700">
              Select Gameweek:
            </label>
            <select
              id="gameweek-select"
              value={selectedGameweek}
              onChange={(e) => setSelectedGameweek(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {Array.from({ length: 38 }, (_, i) => i + 1).map(gw => (
                <option key={gw} value={gw}>
                  Gameweek {gw}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {gameweekFixtures.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Progress ({filledPredictions}/{totalMatches})
            </h3>
            <span className="text-sm text-gray-600">
              {Math.round((filledPredictions / totalMatches) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(filledPredictions / totalMatches) * 100}%` }}
            ></div>
          </div>
          {allPredictionsFilled && submittedPredictions.length < totalMatches && !isLocked && (
            <div className="mt-3 text-center">
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting || isLocked}
                className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
                  allPredictionsFilled && !isSubmitting && !isLocked
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting All Predictions...' : `Submit All ${totalMatches} Predictions`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submitted Predictions */}
      {submittedPredictions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✅ Submitted Predictions (Gameweek {selectedGameweek})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submittedPredictions.map((prediction) => {
              const match = fixtures.find(m => m.id === prediction.matchId);
              if (!match) return null;
              return (
                <PredictionCard
                  key={`${prediction.id}-${refreshKey}`}
                  prediction={prediction}
                  match={match}
                  onPredictionUpdate={handlePredictionUpdate}
                  isLocked={isLocked}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Prediction Forms */}
      {gameweekFixtures.length > 0 && unpredictedFixtures.length > 0 && !isLocked && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Make Your Predictions (Gameweek {selectedGameweek})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unpredictedFixtures.map((match) => {
              const localPrediction = gameweekPredictions[match.id];
              return (
                <PredictionFormCard
                  key={match.id}
                  match={match}
                  homeScore={localPrediction?.homeScore || ''}
                  awayScore={localPrediction?.awayScore || ''}
                  onScoreChange={(team, value) => handleScoreChange(match.id, team, value)}
                  isLocked={isLocked}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* No matches message */}
      {gameweekFixtures.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-800 font-medium mb-2">No fixtures available</div>
          <div className="text-yellow-600 text-sm">
            No fixtures found for Gameweek {selectedGameweek}. Try selecting a different gameweek.
          </div>
        </div>
      )}

      {/* All predictions completed message */}
      {gameweekFixtures.length > 0 && submittedPredictions.length === gameweekFixtures.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-800 font-medium mb-2">✅ Gameweek Complete!</div>
          <div className="text-green-600 text-sm">
            You have submitted all predictions for Gameweek {selectedGameweek}.
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Prediction Form Card Component
interface PredictionFormCardProps {
  match: Match;
  homeScore: string;
  awayScore: string;
  onScoreChange: (team: 'home' | 'away', value: string) => void;
  isLocked?: boolean;
}

const PredictionFormCard: React.FC<PredictionFormCardProps> = ({ 
  match, 
  homeScore, 
  awayScore, 
  onScoreChange,
  isLocked = false
}) => {
  const isPredictionComplete = homeScore !== '' && homeScore !== undefined && awayScore !== '' && awayScore !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 flex items-center space-x-2">
            <span>{formatMatchDate(match.kickoff)}</span>
            <LiveBadge match={match} />
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
                onChange={(e) => onScoreChange('home', e.target.value)}
                disabled={isLocked}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-colors ${
                  isLocked 
                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 focus:border-blue-500 focus:outline-none'
                }`}
                placeholder="0"
                maxLength={2}
              />
              <div className="text-2xl font-bold text-gray-400">-</div>
              <input
                type="text"
                value={awayScore}
                onChange={(e) => onScoreChange('away', e.target.value)}
                disabled={isLocked}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-colors ${
                  isLocked 
                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 focus:border-green-500 focus:outline-none'
                }`}
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

        {/* Status */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              {isLocked ? (
                <span className="text-red-500 font-medium">
                  🔒 Locked
                </span>
              ) : isPredictionComplete ? (
                <span className="text-green-600 font-medium">
                  ✓ Prediction filled
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