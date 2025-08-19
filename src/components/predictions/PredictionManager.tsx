'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types';
import { usePredictions } from '@/contexts/PredictionContext';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';

interface PredictionManagerProps {
  allFixtures: Match[];
}

interface PredictionState {
  [matchId: string]: {
    homeScore: number;
    awayScore: number;
  };
}

const PredictionManager: React.FC<PredictionManagerProps> = ({ allFixtures }) => {
  const { 
    predictions, 
    getPredictionsByGW, 
    savePredictionForMatch, 
    submitPredictions,
    showSuccessMessage, 
    showErrorMessage 
  } = usePredictions();
  
  const [selectedGameweek, setSelectedGameweek] = useState(1);
  const [newPredictions, setNewPredictions] = useState<PredictionState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editedPredictions, setEditedPredictions] = useState<PredictionState>({});

  // Get fixtures for selected gameweek
  const gameweekFixtures = allFixtures.filter(f => f.gameweek === selectedGameweek);
  
  // Get existing predictions for selected gameweek
  const existingPredictions = getPredictionsByGW(selectedGameweek, '2025-26');
  const submittedPredictions = existingPredictions.filter(p => p.status === 'submitted');
  
  // Function to manually trigger refresh
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handlePredictionUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Reset refresh when gameweek changes
  useEffect(() => {
    setRefreshKey(0);
  }, [selectedGameweek]);
  
  // Get fixtures that don't have predictions yet
  const unpredictedFixtures = gameweekFixtures.filter(fixture => 
    !existingPredictions.some(p => p.matchId === fixture.id) &&
    fixture.status === 'SCHEDULED' // Only allow predictions for scheduled matches
  );

  // Load existing draft predictions for the gameweek
  useEffect(() => {
    const currentExistingPredictions = getPredictionsByGW(selectedGameweek, '2025-26');
    const draftPredictions = currentExistingPredictions.filter(p => p.status === 'draft');
    const predictionState: PredictionState = {};
    draftPredictions.forEach(p => {
      predictionState[p.matchId] = { homeScore: p.homeScore, awayScore: p.awayScore };
    });
    setNewPredictions(predictionState);
    
    // Load submitted predictions for editing
    const currentSubmittedPredictions = currentExistingPredictions.filter(p => p.status === 'submitted');
    const editState: PredictionState = {};
    currentSubmittedPredictions.forEach(p => {
      editState[p.matchId] = { homeScore: p.homeScore, awayScore: p.awayScore };
    });
    setEditedPredictions(editState);
    
    // Reset edit mode when changing gameweeks
    setIsEditingMode(false);
  }, [selectedGameweek, getPredictionsByGW]);

  const handlePredictionChange = (matchId: string, homeScore: number, awayScore: number) => {
    setNewPredictions(prev => ({
      ...prev,
      [matchId]: { homeScore, awayScore }
    }));
  };

  const handleEditedPredictionChange = (matchId: string, homeScore: number, awayScore: number) => {
    setEditedPredictions(prev => ({
      ...prev,
      [matchId]: { homeScore, awayScore }
    }));
  };

  const handleEnterEditMode = () => {
    setIsEditingMode(true);
  };

  const handleCancelEdit = () => {
    // Reset edited predictions to original values
    const currentSubmittedPredictions = getPredictionsByGW(selectedGameweek, '2025-26').filter(p => p.status === 'submitted');
    const editState: PredictionState = {};
    currentSubmittedPredictions.forEach(p => {
      editState[p.matchId] = { homeScore: p.homeScore, awayScore: p.awayScore };
    });
    setEditedPredictions(editState);
    setIsEditingMode(false);
  };

  const handleSaveAllEdits = async () => {
    setIsSubmitting(true);
    try {
      const { loadPredictions, savePredictions } = await import('@/lib/storage');
      const allPredictions = loadPredictions();
      
      // Update all edited predictions
      Object.entries(editedPredictions).forEach(([matchId, scores]) => {
        const predIndex = allPredictions.findIndex(p => p.matchId === matchId);
        if (predIndex >= 0) {
          allPredictions[predIndex] = {
            ...allPredictions[predIndex],
            homeScore: scores.homeScore,
            awayScore: scores.awayScore,
            submittedAt: new Date().toISOString()
          };
        }
      });
      
      savePredictions(allPredictions);
      setIsEditingMode(false);
      handlePredictionUpdate();
      showSuccessMessage(`Updated ${Object.keys(editedPredictions).length} predictions successfully!`);
    } catch (error) {
      showErrorMessage('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreChange = (matchId: string, team: 'home' | 'away', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const currentPrediction = newPredictions[matchId] || { homeScore: 0, awayScore: 0 };
      const score = value === '' ? 0 : parseInt(value);
      
      if (team === 'home') {
        handlePredictionChange(matchId, score, currentPrediction.awayScore);
      } else {
        handlePredictionChange(matchId, currentPrediction.homeScore, score);
      }
    }
  };

  const handleSubmitPredictions = async () => {
    const predictionIds = Object.keys(newPredictions);
    
    if (predictionIds.length === 0) {
      showErrorMessage('Please make at least one prediction before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save all predictions first
      for (const [matchId, prediction] of Object.entries(newPredictions)) {
        const match = gameweekFixtures.find(f => f.id === matchId);
        if (match) {
          savePredictionForMatch(
            matchId, 
            prediction.homeScore, 
            prediction.awayScore, 
            match.gameweek, 
            match.season
          );
        }
      }

      // Submit them
      const success = await submitPredictions(predictionIds);
      if (success) {
        setNewPredictions({});
        showSuccessMessage(`Successfully submitted ${predictionIds.length} predictions for Gameweek ${selectedGameweek}!`);
      }
    } catch (error) {
      showErrorMessage('Failed to submit predictions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedPredictionsCount = Object.keys(newPredictions).length;
  const totalUnpredictedMatches = unpredictedFixtures.length;

  return (
    <div className="space-y-6">
      {/* Gameweek Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Prediction Manager</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage predictions for any gameweek
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

      {/* Existing Predictions */}
      {submittedPredictions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              ✅ Your Submitted Predictions (Gameweek {selectedGameweek})
            </h3>
            {!isEditingMode ? (
              <button
                onClick={handleEnterEditMode}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✏️ Edit All Predictions
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAllEdits}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            )}
          </div>

          {isEditingMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-blue-800">
                <span className="mr-2">✏️</span>
                <span className="font-medium">Edit Mode Active</span>
                <span className="ml-2 text-blue-600">- Modify any scores below then save all changes</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submittedPredictions.map((prediction) => {
              const match = allFixtures.find(m => m.id === prediction.matchId);
              if (!match) return null;
              return (
                <EditablePredictionCard
                  key={`${prediction.id}-${refreshKey}-${isEditingMode}`}
                  prediction={prediction}
                  match={match}
                  isEditing={isEditingMode}
                  editedScores={editedPredictions[prediction.matchId]}
                  onScoreChange={(team, value) => {
                    const current = editedPredictions[prediction.matchId] || { homeScore: prediction.homeScore, awayScore: prediction.awayScore };
                    const score = value === '' ? 0 : parseInt(value) || 0;
                    if (team === 'home') {
                      handleEditedPredictionChange(prediction.matchId, score, current.awayScore);
                    } else {
                      handleEditedPredictionChange(prediction.matchId, current.homeScore, score);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* New Predictions Section */}
      {unpredictedFixtures.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Make New Predictions (Gameweek {selectedGameweek})
          </h3>
          
          {/* Progress indicator */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {completedPredictionsCount}/{totalUnpredictedMatches} predictions made
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {completedPredictionsCount === totalUnpredictedMatches && totalUnpredictedMatches > 0
                    ? 'All predictions complete! Ready to submit.'
                    : 'Complete all predictions to submit for this gameweek'
                  }
                </div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalUnpredictedMatches > 0 ? (completedPredictionsCount / totalUnpredictedMatches) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Prediction Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unpredictedFixtures.map((match) => (
              <PredictionForm
                key={match.id}
                match={match}
                prediction={newPredictions[match.id]}
                onScoreChange={(team, value) => handleScoreChange(match.id, team, value)}
              />
            ))}
          </div>

          {/* Submit Button */}
          {completedPredictionsCount === totalUnpredictedMatches && totalUnpredictedMatches > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 All predictions complete!
                </h4>
                <p className="text-gray-600 mb-4">
                  You have completed all {totalUnpredictedMatches} predictions for Gameweek {selectedGameweek}. Ready to submit?
                </p>
                <button 
                  onClick={handleSubmitPredictions}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : `Submit ${totalUnpredictedMatches} Predictions`}
                </button>
              </div>
            </div>
          )}
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

      {/* All predictions made message */}
      {gameweekFixtures.length > 0 && unpredictedFixtures.length === 0 && submittedPredictions.length === gameweekFixtures.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-800 font-medium mb-2">✅ Gameweek Complete!</div>
          <div className="text-green-600 text-sm">
            You have submitted predictions for all matches in Gameweek {selectedGameweek}.
          </div>
        </div>
      )}
    </div>
  );
};

// Editable Prediction Card Component
interface EditablePredictionCardProps {
  prediction: StoredPrediction;
  match: Match;
  isEditing: boolean;
  editedScores?: { homeScore: number; awayScore: number };
  onScoreChange: (team: 'home' | 'away', value: string) => void;
}

const EditablePredictionCard: React.FC<EditablePredictionCardProps> = ({ 
  prediction, 
  match, 
  isEditing, 
  editedScores, 
  onScoreChange 
}) => {
  const displayScores = editedScores || { homeScore: prediction.homeScore, awayScore: prediction.awayScore };
  const matchStarted = match.status === 'LIVE' || match.status === 'FINISHED';
  const canEdit = !matchStarted;

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

      {/* Teams and Score */}
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

          {/* Score Display/Edit */}
          <div className="flex-shrink-0 mx-6">
            <div className="text-center">
              {isEditing && canEdit ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={displayScores.homeScore.toString()}
                    onChange={(e) => onScoreChange('home', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="0"
                    maxLength={2}
                  />
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <input
                    type="text"
                    value={displayScores.awayScore.toString()}
                    onChange={(e) => onScoreChange('away', e.target.value)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="0"
                    maxLength={2}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 text-green-800 rounded-lg flex items-center justify-center text-lg font-bold">
                    {displayScores.homeScore}
                  </div>
                  <div className="text-xl font-bold text-gray-400">-</div>
                  <div className="w-10 h-10 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center text-lg font-bold">
                    {displayScores.awayScore}
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

        {/* Actual Result (if available) */}
        {match.homeScore !== undefined && match.awayScore !== undefined && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Actual Result</div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
                  {match.homeScore}
                </div>
                <div className="text-lg font-bold text-gray-400">-</div>
                <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
                  {match.awayScore}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Points: To be calculated
              </div>
            </div>
          </div>
        )}

        {/* Status indicator for started matches */}
        {matchStarted && isEditing && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                🚫 Match started - editing disabled
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

// Prediction Form Component
interface PredictionFormProps {
  match: Match;
  prediction?: { homeScore: number; awayScore: number };
  onScoreChange: (team: 'home' | 'away', value: string) => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ match, prediction, onScoreChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
                value={prediction?.homeScore?.toString() || ''}
                onChange={(e) => onScoreChange('home', e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                placeholder="0"
                maxLength={2}
              />
              <div className="text-2xl font-bold text-gray-400">-</div>
              <input
                type="text"
                value={prediction?.awayScore?.toString() || ''}
                onChange={(e) => onScoreChange('away', e.target.value)}
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
              {prediction && prediction.homeScore !== undefined && prediction.awayScore !== undefined ? (
                <span className="text-green-600 font-medium">
                  ✓ Prediction ready
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

export default PredictionManager;