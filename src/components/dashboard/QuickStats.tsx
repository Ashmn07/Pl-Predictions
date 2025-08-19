import React from 'react';

interface QuickStatsProps {
  totalPoints: number;
  currentRank: number;
  predictionsMade: number;
  accuracyRate: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  totalPoints,
  currentRank,
  predictionsMade,
  accuracyRate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-200 transition-colors">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Total Points
        </h3>
        <p className="mt-2 text-3xl font-bold text-green-600">{totalPoints}</p>
        <p className="mt-2 text-sm text-gray-600">
          {totalPoints === 0 ? 'No predictions yet' : 'This season'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-200 transition-colors">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Current Rank
        </h3>
        <p className="mt-2 text-3xl font-bold text-purple-600">
          {currentRank > 0 ? `#${currentRank}` : '-'}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {currentRank === 0 ? 'Make your first prediction' : 'Out of all predictors'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-200 transition-colors">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Predictions Made
        </h3>
        <p className="mt-2 text-3xl font-bold text-green-600">{predictionsMade}</p>
        <p className="mt-2 text-sm text-gray-600">This gameweek</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-200 transition-colors">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Accuracy Rate
        </h3>
        <p className="mt-2 text-3xl font-bold text-purple-600">
          {accuracyRate > 0 ? `${accuracyRate}%` : '-%'}
        </p>
        <p className="mt-2 text-sm text-gray-600">All time</p>
      </div>
    </div>
  );
};

export default QuickStats;