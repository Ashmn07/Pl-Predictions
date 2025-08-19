'use client';

import React, { useState, useEffect } from 'react';
import { usePredictions } from '@/contexts/PredictionContext';
import { Match } from '@/types';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';
import { calculatePoints } from '@/lib/points';
import { getMostRecentGameweek } from '@/lib/gameweek-utils';
import { LiveScoresSummary, LiveMatchIndicator } from '@/components/live/LiveMatchIndicator';

export default function Results() {
  const { isLoading, getPredictionsByGW } = usePredictions();
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [selectedGameweek, setSelectedGameweek] = useState(1);

  // Fetch all fixtures for the season
  useEffect(() => {
    async function fetchAllFixtures() {
      try {
        setFixturesLoading(true);
        const response = await fetch(`/api/fixtures?season=2025-26`);
        const data = await response.json();
        
        if (data.success && data.fixtures) {
          setFixtures(data.fixtures);
          
          // Set the default gameweek to the most recent completed one
          const recentGW = getMostRecentGameweek(data.fixtures);
          setSelectedGameweek(recentGW);
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setFixturesLoading(false);
      }
    }

    fetchAllFixtures();
  }, []);

  if (isLoading || fixturesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading results...</span>
      </div>
    );
  }

  // Get fixtures for selected gameweek
  const gameweekFixtures = fixtures.filter(f => f.gameweek === selectedGameweek);
  
  // Get user's predictions for selected gameweek
  const userPredictions = getPredictionsByGW(selectedGameweek, '2025-26');
  
  console.log('Debug - Gameweek fixtures:', gameweekFixtures);
  console.log('Debug - User predictions:', userPredictions);

  // Calculate total points for the gameweek
  const totalPoints = userPredictions.reduce((sum, prediction) => {
    const match = gameweekFixtures.find(f => f.id === prediction.matchId);
    if (match && match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null) {
      const pointsResult = calculatePoints(
        prediction.homeScore,
        prediction.awayScore,
        match.homeScore,
        match.awayScore
      );
      return sum + pointsResult.points;
    }
    return sum;
  }, 0);

  // Count completed matches
  const completedMatches = gameweekFixtures.filter(f => f.status === 'FINISHED').length;
  const totalMatches = gameweekFixtures.length;

  // Calculate accuracy rate
  const calculateAccuracyRate = () => {
    if (userPredictions.length === 0) return 0;
    
    const completedMatchPredictions = userPredictions.filter(p => {
      const match = gameweekFixtures.find(f => f.id === p.matchId);
      return match && match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null;
    });
    
    if (completedMatchPredictions.length === 0) return 0;
    
    const correctPredictions = completedMatchPredictions.filter(p => {
      const match = gameweekFixtures.find(f => f.id === p.matchId);
      if (match && match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null) {
        const pointsResult = calculatePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
        return pointsResult.points > 0;
      }
      return false;
    });
    
    return Math.round((correctPredictions.length / completedMatchPredictions.length) * 100);
  };

  const accuracyRate = calculateAccuracyRate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results</h1>
        <p className="mt-2 text-gray-600">
          View your predictions vs actual results and points earned
        </p>
      </div>

      {/* Live Scores Summary */}
      <LiveScoresSummary />

      {/* Gameweek Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Results Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare your predictions with actual match results
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

      {/* Points Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{completedMatches}/{totalMatches}</div>
            <div className="text-sm text-gray-600">Matches Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {accuracyRate}%
            </div>
            <div className="text-sm text-gray-600">Accuracy Rate</div>
          </div>
        </div>
      </div>

      {/* Results Cards */}
      {gameweekFixtures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameweekFixtures.map((match) => {
            const prediction = userPredictions.find(p => p.matchId === match.id);
            return (
              <ResultCard
                key={match.id}
                match={match}
                prediction={prediction}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-800 font-medium mb-2">No fixtures available</div>
          <div className="text-yellow-600 text-sm">
            No fixtures found for Gameweek {selectedGameweek}.
          </div>
        </div>
      )}
    </div>
  );
}

// Result Card Component
interface ResultCardProps {
  match: Match;
  prediction?: {
    homeScore: number;
    awayScore: number;
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ match, prediction }) => {
  const hasResult = match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null;
  const hasLiveScore = match.status === 'LIVE' && match.homeScore !== null && match.awayScore !== null;
  
  // Calculate points if we have both prediction and result
  const pointsResult = (prediction && hasResult) ? calculatePoints(
    prediction.homeScore,
    prediction.awayScore,
    match.homeScore!,
    match.awayScore!
  ) : null;
  
  const getPointsColor = (points?: number) => {
    if (!points) return 'text-gray-400';
    if (points >= 5) return 'text-green-600';
    if (points >= 3) return 'text-blue-600';
    if (points >= 1) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getStatusBadge = () => {
    switch (match.status) {
      case 'FINISHED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">FINISHED</span>;
      case 'LIVE':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium animate-pulse">LIVE</span>;
      case 'SCHEDULED':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">SCHEDULED</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{match.status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {formatMatchDate(match.kickoff)}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">{formatMatchTime(match.kickoff)}</span>
            <LiveMatchIndicator 
              match={match} 
              showScores={false} 
              showStatus={true}
              className="ml-2"
            />
          </div>
        </div>
      </div>

      {/* Teams and Scores */}
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

          {/* Scores Section */}
          <div className="flex-shrink-0 mx-4 space-y-3">
            {/* Actual Result with Live Updates */}
            {(hasResult || hasLiveScore) && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1 flex items-center justify-center space-x-2">
                  <span>Actual</span>
                  <LiveMatchIndicator 
                    match={match} 
                    showScores={false} 
                    showStatus={false}
                    className="text-xs"
                  />
                </div>
                <LiveMatchIndicator 
                  match={match} 
                  showScores={true} 
                  showStatus={false}
                  className="flex justify-center"
                />
              </div>
            )}

            {/* User Prediction */}
            {prediction && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Your Prediction</div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    {prediction.homeScore}
                  </div>
                  <div className="text-2xl font-bold text-gray-400">-</div>
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    {prediction.awayScore}
                  </div>
                </div>
              </div>
            )}

            {/* Points */}
            {pointsResult && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Points Earned</div>
                <div className={`text-2xl font-bold ${getPointsColor(pointsResult.points)}`}>
                  {pointsResult.points} pts
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {pointsResult.reasoning}
                </div>
              </div>
            )}
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

        {/* Bottom Info */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Gameweek {match.gameweek}</span>
            {!prediction && (
              <span className="text-red-500 font-medium">No prediction made</span>
            )}
            {prediction && !hasResult && match.status === 'SCHEDULED' && (
              <span className="text-blue-500 font-medium">Prediction submitted</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};