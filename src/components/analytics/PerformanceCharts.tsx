'use client';

import React, { useState } from 'react';
import { PerformanceDataPoint, SeasonalTrends } from '@/lib/analyticsData';

interface PerformanceChartsProps {
  data: PerformanceDataPoint[];
  trends: SeasonalTrends;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ data, trends }) => {
  const [activeChart, setActiveChart] = useState<'points' | 'rank' | 'combined'>('combined');

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-gray-500">No performance data available yet</p>
        </div>
      </div>
    );
  }

  const maxPoints = Math.max(...data.map(d => d.points));
  const maxRank = Math.max(...data.map(d => d.rank));
  const minRank = Math.min(...data.map(d => d.rank));

  const chartOptions = [
    { id: 'combined' as const, label: 'Combined View', icon: '📊' },
    { id: 'points' as const, label: 'Points Only', icon: '🏆' },
    { id: 'rank' as const, label: 'Rank Only', icon: '📈' }
  ];

  const getPointsBarHeight = (points: number) => {
    return Math.max(8, (points / maxPoints) * 100);
  };

  const getRankBarHeight = (rank: number) => {
    // Invert rank for visual representation (lower rank = higher bar)
    const invertedRank = maxRank - rank + minRank;
    return Math.max(8, (invertedRank / maxRank) * 100);
  };

  const getTrendArrow = () => {
    if (trends.trendDirection === 'improving') return '📈';
    if (trends.trendDirection === 'declining') return '📉';
    return '➖';
  };

  const getTrendColor = () => {
    if (trends.trendDirection === 'improving') return 'text-green-600 bg-green-100';
    if (trends.trendDirection === 'declining') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>📊</span>
            <span>Performance Analysis</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Points and ranking trends over time</p>
        </div>

        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
          <span>{getTrendArrow()}</span>
          <span className="capitalize">{trends.trendDirection}</span>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {chartOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveChart(option.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeChart === option.id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="mb-6">
        <div className="flex items-end justify-between space-x-2 h-40 mb-4 relative">
          {data.map((point) => (
            <div key={point.gameweek} className="flex flex-col items-center flex-1 relative">
              {/* Combined Chart */}
              {activeChart === 'combined' && (
                <>
                  {/* Points Bar */}
                  <div className="w-full mb-1 relative">
                    <div 
                      className="bg-gradient-to-t from-green-400 to-green-600 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-700 cursor-pointer group"
                      style={{ height: `${getPointsBarHeight(point.points)}px` }}
                      title={`GW${point.gameweek}: ${point.points} points`}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-700">
                        {point.points}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rank Line */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white z-10"
                       title={`Rank: #${point.rank}`}
                       style={{ 
                         bottom: `${getRankBarHeight(point.rank)}px`,
                         transform: 'translateX(-50%)'
                       }}>
                  </div>
                </>
              )}

              {/* Points Only Chart */}
              {activeChart === 'points' && (
                <div className="w-full relative">
                  <div 
                    className="bg-gradient-to-t from-green-400 to-green-600 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-700 cursor-pointer"
                    style={{ height: `${getPointsBarHeight(point.points)}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-700">
                      {point.points}
                    </div>
                  </div>
                </div>
              )}

              {/* Rank Only Chart */}
              {activeChart === 'rank' && (
                <div className="w-full relative">
                  <div 
                    className="bg-gradient-to-t from-purple-400 to-purple-600 rounded-t transition-all duration-300 hover:from-purple-500 hover:to-purple-700 cursor-pointer"
                    style={{ height: `${getRankBarHeight(point.rank)}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-purple-700">
                      #{point.rank}
                    </div>
                  </div>
                </div>
              )}

              {/* Gameweek Label */}
              <div className="text-xs font-medium text-gray-600 mt-2">GW{point.gameweek}</div>
              
              {/* Rank Change Indicator */}
              {point.rankChange !== 0 && (
                <div className={`text-xs mt-1 ${
                  point.rankChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {point.rankChange > 0 ? '↗' : '↘'} {Math.abs(point.rankChange)}
                </div>
              )}
            </div>
          ))}

          {/* Rank Line Connection for Combined Chart */}
          {activeChart === 'combined' && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
              <polyline
                points={data.map((point, dataIndex) => {
                  const x = (dataIndex + 0.5) * (100 / data.length) + '%';
                  const y = `${100 - getRankBarHeight(point.rank)}%`;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            </svg>
          )}
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          {(activeChart === 'combined' || activeChart === 'points') && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
              <span>Points Earned</span>
            </div>
          )}
          {(activeChart === 'combined' || activeChart === 'rank') && (
            <div className="flex items-center space-x-2">
              {activeChart === 'combined' ? (
                <div className="w-3 h-3 bg-purple-500 rounded-full border border-white"></div>
              ) : (
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded"></div>
              )}
              <span>League Rank</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-700">
            {trends.averagePoints}
          </div>
          <div className="text-sm text-gray-600">Avg Points/GW</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-700">
            {trends.bestGameweek.points}
          </div>
          <div className="text-sm text-gray-600">Best Week</div>
          <div className="text-xs text-gray-500">GW{trends.bestGameweek.gameweek}</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-700">
            {trends.consistencyScore}
          </div>
          <div className="text-sm text-gray-600">Consistency</div>
          <div className="text-xs text-gray-500">0-100 scale</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-700">
            {data[data.length - 1]?.rank || 0}
          </div>
          <div className="text-sm text-gray-600">Current Rank</div>
          <div className="text-xs text-gray-500">
            {data.length > 1 && data[data.length - 1]?.rankChange !== 0 && (
              <span className={data[data.length - 1]?.rankChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {data[data.length - 1]?.rankChange > 0 ? '↗' : '↘'} {Math.abs(data[data.length - 1]?.rankChange)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Best Predictions */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Best Predictions This Season</h4>
        <div className="space-y-2">
          {data
            .filter(d => d.bestPrediction)
            .sort((a, b) => (b.bestPrediction?.points || 0) - (a.bestPrediction?.points || 0))
            .slice(0, 3)
            .map((point) => (
              <div key={point.gameweek} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">GW{point.gameweek}</span>
                  <span className="text-sm text-gray-600">
                    {point.bestPrediction?.homeTeam} vs {point.bestPrediction?.awayTeam}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Predicted: {point.bestPrediction?.predicted}
                  </span>
                  <span className="text-sm text-gray-600">
                    Actual: {point.bestPrediction?.actual}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    +{point.bestPrediction?.points} pts
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;