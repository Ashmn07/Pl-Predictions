'use client';

import React from 'react';
import { PerformanceDataPoint } from '@/lib/analyticsData';

interface AccuracyTrackerProps {
  data: PerformanceDataPoint[];
  showTrend?: boolean;
}

const AccuracyTracker: React.FC<AccuracyTrackerProps> = ({ data, showTrend = true }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Tracking</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">No prediction data available yet</p>
          <p className="text-sm text-gray-400 mt-2">Make predictions to see your accuracy trends</p>
        </div>
      </div>
    );
  }

  const maxAccuracy = Math.max(...data.map(d => d.accuracyRate));
  const minAccuracy = Math.min(...data.map(d => d.accuracyRate));
  const avgAccuracy = data.reduce((sum, d) => sum + d.accuracyRate, 0) / data.length;
  const latestAccuracy = data[data.length - 1]?.accuracyRate || 0;
  const previousAccuracy = data[data.length - 2]?.accuracyRate || latestAccuracy;
  const accuracyChange = latestAccuracy - previousAccuracy;

  const getAccuracyBarHeight = (accuracy: number) => {
    const maxHeight = 120;
    return Math.max(4, (accuracy / 100) * maxHeight);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'from-green-400 to-green-600';
    if (accuracy >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getTrendIcon = () => {
    if (accuracyChange > 5) return '📈';
    if (accuracyChange < -5) return '📉';
    return '➖';
  };

  const getTrendColor = () => {
    if (accuracyChange > 5) return 'text-green-600 bg-green-100';
    if (accuracyChange < -5) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🎯</span>
            <span>Accuracy Tracking</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">Your prediction accuracy over time</p>
        </div>
        
        {showTrend && (
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>
              {accuracyChange > 0 ? '+' : ''}{accuracyChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Accuracy Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between space-x-1 h-32 mb-4">
          {data.map((point) => (
            <div key={point.gameweek} className="flex flex-col items-center flex-1">
              {/* Accuracy Bar */}
              <div className="w-full relative mb-2 flex items-end justify-center">
                <div 
                  className={`w-full bg-gradient-to-t ${getAccuracyColor(point.accuracyRate)} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer group relative`}
                  style={{ 
                    height: `${getAccuracyBarHeight(point.accuracyRate)}px`,
                    minHeight: '4px'
                  }}
                  title={`GW${point.gameweek}: ${point.accuracyRate}%`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {point.accuracyRate}% accuracy
                  </div>
                </div>
                
                {/* Value label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                  {point.accuracyRate}%
                </div>
              </div>
              
              {/* Gameweek Label */}
              <div className="text-xs font-medium text-gray-600">GW{point.gameweek}</div>
              
              {/* Correct predictions */}
              <div className="text-xs text-gray-500 mt-1">
                {point.correctPredictions}/{point.predictions}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
            <span>≥70% (Excellent)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
            <span>50-69% (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
            <span>&lt;50% (Needs Work)</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-700">
            {latestAccuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Latest</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-700">
            {avgAccuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Average</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-700">
            {maxAccuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Best Week</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-700">
            {minAccuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Worst Week</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Weekly Breakdown</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.map((point) => (
            <div key={point.gameweek} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900 w-8">GW{point.gameweek}</span>
                <span className="text-gray-600">{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{point.correctPredictions}/{point.predictions} correct</span>
                <span className={`font-medium ${
                  point.accuracyRate >= 70 ? 'text-green-600' :
                  point.accuracyRate >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {point.accuracyRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccuracyTracker;