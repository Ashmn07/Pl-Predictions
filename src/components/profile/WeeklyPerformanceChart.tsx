'use client';

import React from 'react';
import { LeaderboardUser } from '@/lib/mockUsers';

interface WeeklyPerformanceChartProps {
  user: LeaderboardUser;
}

const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({ user }) => {
  // Mock weekly data for demonstration
  const weeklyData = [
    { week: 'GW1', points: 12, rank: 15, predictions: 8 },
    { week: 'GW2', points: 8, rank: 18, predictions: 10 },
    { week: 'GW3', points: 22, rank: 8, predictions: 10 },
    { week: 'GW4', points: user.weeklyPoints, rank: user.currentRank, predictions: user.predictionsMade }
  ];

  const maxPoints = Math.max(...weeklyData.map(w => w.points));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <span>📈</span>
        <span>Weekly Performance</span>
      </h3>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between space-x-2 h-40 mb-4">
          {weeklyData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col items-center flex-1">
              {/* Points Bar */}
              <div className="w-full relative mb-2">
                <div 
                  className="bg-gradient-to-t from-green-400 to-green-600 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-700"
                  style={{ 
                    height: `${(week.points / maxPoints) * 120}px`,
                    minHeight: '4px'
                  }}
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                  {week.points}
                </div>
              </div>
              
              {/* Week Label */}
              <div className="text-sm font-medium text-gray-600">{week.week}</div>
              
              {/* Rank */}
              <div className="text-xs text-gray-500 mt-1">#{week.rank}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
            <span>Points Earned</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Rank Position</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-700">
            {weeklyData.reduce((sum, week) => sum + week.points, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-700">
            {Math.round(weeklyData.reduce((sum, week) => sum + week.points, 0) / weeklyData.length)}
          </div>
          <div className="text-sm text-gray-600">Avg per Week</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-700">
            {user.bestWeek}
          </div>
          <div className="text-sm text-gray-600">Best Week</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-700">
            #{Math.min(...weeklyData.map(w => w.rank))}
          </div>
          <div className="text-sm text-gray-600">Best Rank</div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Performance Trend</h4>
        <div className="space-y-2">
          {weeklyData.map((week, index) => {
            const prevWeek = weeklyData[index - 1];
            const pointsChange = prevWeek ? week.points - prevWeek.points : 0;
            const rankChange = prevWeek ? prevWeek.rank - week.rank : 0;
            
            return (
              <div key={week.week} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{week.week}</span>
                  <span className="text-sm text-gray-600">{week.predictions} predictions</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-sm font-medium ${pointsChange > 0 ? 'text-green-600' : pointsChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {pointsChange > 0 ? `+${pointsChange}` : pointsChange} pts
                  </div>
                  <div className={`text-sm font-medium ${rankChange > 0 ? 'text-green-600' : rankChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {rankChange > 0 ? `+${rankChange}` : rankChange < 0 ? rankChange : '='} rank
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPerformanceChart;