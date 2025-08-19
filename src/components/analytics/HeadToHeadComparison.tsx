'use client';

import React, { useState } from 'react';
import { HeadToHeadComparison } from '@/lib/analyticsData';

interface HeadToHeadComparisonProps {
  comparisons: HeadToHeadComparison[];
}

const HeadToHeadComparisonComponent: React.FC<HeadToHeadComparisonProps> = ({ comparisons }) => {
  const [selectedOpponent, setSelectedOpponent] = useState<string>(comparisons[0]?.opponentId || '');

  if (comparisons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Head-to-Head Comparisons</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚔️</div>
          <p className="text-gray-500">No comparison data available yet</p>
        </div>
      </div>
    );
  }

  const selectedComparison = comparisons.find(c => c.opponentId === selectedOpponent) || comparisons[0];
  const winRate = (selectedComparison.yourWins / selectedComparison.matchesCompared) * 100;
  const drawRate = (selectedComparison.draws / selectedComparison.matchesCompared) * 100;
  const lossRate = (selectedComparison.theirWins / selectedComparison.matchesCompared) * 100;

  const getWinRateColor = () => {
    if (winRate >= 60) return 'text-green-600 bg-green-100';
    if (winRate >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLastEncounterResult = () => {
    const { winner } = selectedComparison.lastEncounter;
    if (winner === 'you') return { icon: '🏆', text: 'You Won', color: 'text-green-600 bg-green-100' };
    if (winner === 'them') return { icon: '😔', text: 'They Won', color: 'text-red-600 bg-red-100' };
    return { icon: '🤝', text: 'Draw', color: 'text-gray-600 bg-gray-100' };
  };

  const lastResult = getLastEncounterResult();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>⚔️</span>
            <span>Head-to-Head Comparisons</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Compare your performance with other predictors</p>
        </div>
      </div>

      {/* Opponent Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Opponent:</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {comparisons.map((comparison) => (
            <button
              key={comparison.opponentId}
              onClick={() => setSelectedOpponent(comparison.opponentId)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedOpponent === comparison.opponentId
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{comparison.opponentAvatar}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">{comparison.opponentName}</div>
                  <div className="text-xs text-gray-500">{comparison.matchesCompared} matches</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Comparison */}
      <div className="bg-gradient-to-r from-green-50 via-white to-purple-50 rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* You */}
          <div className="text-center">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-lg font-bold text-green-700">You</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{selectedComparison.yourTotalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="text-lg font-semibold text-green-600 mt-2">{selectedComparison.yourAccuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>

          {/* VS & Record */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400 mb-2">VS</div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-lg font-bold text-gray-900 mb-2">Match Record</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-green-100 rounded p-2">
                  <div className="font-bold text-green-700">{selectedComparison.yourWins}</div>
                  <div className="text-green-600">Wins</div>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <div className="font-bold text-gray-700">{selectedComparison.draws}</div>
                  <div className="text-gray-600">Draws</div>
                </div>
                <div className="bg-red-100 rounded p-2">
                  <div className="font-bold text-red-700">{selectedComparison.theirWins}</div>
                  <div className="text-red-600">Losses</div>
                </div>
              </div>
              <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${getWinRateColor()}`}>
                {winRate.toFixed(0)}% Win Rate
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div className="text-center">
            <div className="text-4xl mb-2">{selectedComparison.opponentAvatar}</div>
            <div className="text-lg font-bold text-purple-700">{selectedComparison.opponentName}</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{selectedComparison.theirTotalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="text-lg font-semibold text-purple-600 mt-2">{selectedComparison.theirAccuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Win Rate Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Breakdown</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Your Wins</span>
                <span className="font-medium text-green-600">{winRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${winRate}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Draws</span>
                <span className="font-medium text-gray-600">{drawRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${drawRate}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Their Wins</span>
                <span className="font-medium text-red-600">{lossRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${lossRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Points Per Match</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👤</span>
                <span className="text-sm font-medium">You</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {(selectedComparison.yourTotalPoints / selectedComparison.matchesCompared).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">pts/match</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{selectedComparison.opponentAvatar}</span>
                <span className="text-sm font-medium">{selectedComparison.opponentName}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {(selectedComparison.theirTotalPoints / selectedComparison.matchesCompared).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">pts/match</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Encounter */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Last Encounter</h4>
            <p className="text-sm text-gray-600">Gameweek {selectedComparison.lastEncounter.gameweek}</p>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${lastResult.color}`}>
            <span>{lastResult.icon}</span>
            <span>{lastResult.text}</span>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{selectedComparison.lastEncounter.yourPoints}</div>
            <div className="text-xs text-gray-500">Your Points</div>
          </div>
          
          <div className="text-2xl text-gray-400 font-bold">VS</div>
          
          <div>
            <div className="text-lg font-bold text-purple-600">{selectedComparison.lastEncounter.theirPoints}</div>
            <div className="text-xs text-gray-500">Their Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadToHeadComparisonComponent;