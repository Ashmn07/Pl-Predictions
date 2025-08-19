'use client';

import React, { useState } from 'react';
import { MatchDifficulty, getDifficultyColor } from '@/lib/analyticsData';

interface MatchDifficultyRatingsProps {
  matches: MatchDifficulty[];
}

const MatchDifficultyRatings: React.FC<MatchDifficultyRatingsProps> = ({ matches }) => {
  const [sortBy, setSortBy] = useState<'difficulty' | 'accuracy' | 'points'>('difficulty');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard' | 'expert'>('all');

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Difficulty Analysis</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500">No match difficulty data available</p>
        </div>
      </div>
    );
  }

  const filteredMatches = matches.filter(match => 
    filterDifficulty === 'all' || match.difficulty === filterDifficulty
  );

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'difficulty':
        return b.difficultyScore - a.difficultyScore;
      case 'accuracy':
        return a.averageAccuracy - b.averageAccuracy;
      case 'points':
        return b.pointsAwarded - a.pointsAwarded;
      default:
        return 0;
    }
  });

  const difficultyDistribution = {
    easy: matches.filter(m => m.difficulty === 'easy').length,
    medium: matches.filter(m => m.difficulty === 'medium').length,
    hard: matches.filter(m => m.difficulty === 'hard').length,
    expert: matches.filter(m => m.difficulty === 'expert').length
  };

  const yourAccuracyByDifficulty = {
    easy: matches.filter(m => m.difficulty === 'easy' && m.yourAccuracy).length / Math.max(1, matches.filter(m => m.difficulty === 'easy').length) * 100,
    medium: matches.filter(m => m.difficulty === 'medium' && m.yourAccuracy).length / Math.max(1, matches.filter(m => m.difficulty === 'medium').length) * 100,
    hard: matches.filter(m => m.difficulty === 'hard' && m.yourAccuracy).length / Math.max(1, matches.filter(m => m.difficulty === 'hard').length) * 100,
    expert: matches.filter(m => m.difficulty === 'expert' && m.yourAccuracy).length / Math.max(1, matches.filter(m => m.difficulty === 'expert').length) * 100
  };

  const getDifficultyIcon = (difficulty: MatchDifficulty['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🟠';
      case 'expert': return '🔴';
    }
  };

  const getFactorBarWidth = (value: number) => Math.min(100, value);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🎯</span>
            <span>Match Difficulty Analysis</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Understand which matches are hardest to predict</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Difficulty:</label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as 'all' | 'easy' | 'medium' | 'hard' | 'expert')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'difficulty' | 'accuracy' | 'points')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="difficulty">Difficulty Score</option>
            <option value="accuracy">Community Accuracy</option>
            <option value="points">Points Awarded</option>
          </select>
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(difficultyDistribution).map(([difficulty, count]) => (
          <div key={difficulty} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{getDifficultyIcon(difficulty as MatchDifficulty['difficulty'])}</div>
            <div className="text-lg font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{difficulty}</div>
            <div className="text-xs text-gray-500 mt-1">
              {yourAccuracyByDifficulty[difficulty as keyof typeof yourAccuracyByDifficulty].toFixed(0)}% your accuracy
            </div>
          </div>
        ))}
      </div>

      {/* Match List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">
          {filteredMatches.length} Match{filteredMatches.length !== 1 ? 'es' : ''} 
          {filterDifficulty !== 'all' && ` (${filterDifficulty.charAt(0).toUpperCase() + filterDifficulty.slice(1)} Difficulty)`}
        </h4>
        
        <div className="space-y-3">
          {sortedMatches.map((match) => (
            <div key={match.matchId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getDifficultyIcon(match.difficulty)}</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {match.homeTeam} vs {match.awayTeam}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(match.difficulty)}`}>
                        {match.difficulty.charAt(0).toUpperCase() + match.difficulty.slice(1)} ({match.difficultyScore}/100)
                      </span>
                      <span className="text-sm text-gray-600">
                        {match.averageAccuracy}% community accuracy
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    match.yourAccuracy 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {match.yourAccuracy ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    +{match.pointsAwarded} points
                  </div>
                </div>
              </div>

              {/* Difficulty Factors */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Difficulty Factors:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Team Strength Difference</span>
                      <span>{match.factors.teamStrengthDifference}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${getFactorBarWidth(match.factors.teamStrengthDifference)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Historical Upsets</span>
                      <span>{match.factors.historicalUpsets}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-red-500 h-1.5 rounded-full" 
                        style={{ width: `${getFactorBarWidth(match.factors.historicalUpsets)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Form Variance</span>
                      <span>{match.factors.formVariance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full" 
                        style={{ width: `${getFactorBarWidth(match.factors.formVariance)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Injuries Impact</span>
                      <span>{match.factors.injuriesImpact}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full" 
                        style={{ width: `${getFactorBarWidth(match.factors.injuriesImpact)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Your Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-lg font-bold text-green-700">
              {matches.filter(m => m.yourAccuracy).length}/{matches.length}
            </div>
            <div className="text-sm text-gray-600">Overall Accuracy</div>
            <div className="text-xs text-gray-500 mt-1">
              {((matches.filter(m => m.yourAccuracy).length / matches.length) * 100).toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-lg font-bold text-blue-700">
              {matches.reduce((sum, m) => sum + m.pointsAwarded, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="text-xs text-gray-500 mt-1">
              {(matches.reduce((sum, m) => sum + m.pointsAwarded, 0) / matches.length).toFixed(1)} avg
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-lg font-bold text-purple-700">
              {matches.filter(m => m.difficulty === 'expert' && m.yourAccuracy).length}
            </div>
            <div className="text-sm text-gray-600">Expert Predictions</div>
            <div className="text-xs text-gray-500 mt-1">
              Hardest matches correct
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDifficultyRatings;