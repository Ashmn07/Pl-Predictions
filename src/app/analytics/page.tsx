'use client';

import React, { useState } from 'react';
import { 
  MOCK_PERFORMANCE_DATA, 
  MOCK_MATCH_DIFFICULTIES, 
  MOCK_HEAD_TO_HEAD,
  calculateSeasonalTrends,
  generateInsights
} from '@/lib/analyticsData';
import AccuracyTracker from '@/components/analytics/AccuracyTracker';
import PerformanceCharts from '@/components/analytics/PerformanceCharts';
import HeadToHeadComparison from '@/components/analytics/HeadToHeadComparison';
import MatchDifficultyRatings from '@/components/analytics/MatchDifficultyRatings';
import InsightsPanel from '@/components/analytics/InsightsPanel';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'accuracy' | 'performance' | 'difficulty' | 'headtohead' | 'insights'>('overview');

  // Calculate trends and insights
  const trends = calculateSeasonalTrends(MOCK_PERFORMANCE_DATA);
  const insights = generateInsights(MOCK_PERFORMANCE_DATA, trends);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'accuracy' as const, label: 'Accuracy', icon: '🎯' },
    { id: 'performance' as const, label: 'Performance', icon: '📈' },
    { id: 'difficulty' as const, label: 'Match Difficulty', icon: '🎲' },
    { id: 'headtohead' as const, label: 'Head-to-Head', icon: '⚔️' },
    { id: 'insights' as const, label: 'AI Insights', icon: '💡' }
  ];

  const overviewStats = [
    { label: 'Season Average', value: `${trends.averagePoints} pts/GW`, icon: '📊', color: 'bg-blue-100 text-blue-700' },
    { label: 'Accuracy Rate', value: `${trends.averageAccuracy}%`, icon: '🎯', color: 'bg-green-100 text-green-700' },
    { label: 'Consistency Score', value: `${trends.consistencyScore}/100`, icon: '⚖️', color: 'bg-purple-100 text-purple-700' },
    { label: 'Current Trend', value: trends.trendDirection, icon: trends.trendDirection === 'improving' ? '📈' : trends.trendDirection === 'declining' ? '📉' : '➖', color: trends.trendDirection === 'improving' ? 'bg-green-100 text-green-700' : trends.trendDirection === 'declining' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="mt-2 text-gray-600">
          Deep insights into your prediction performance and trends
        </p>
      </div>

      {/* Overview Stats Cards (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="text-lg font-bold text-gray-900 capitalize">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Performance Chart */}
            <PerformanceCharts data={MOCK_PERFORMANCE_DATA} trends={trends} />
            
            {/* Top Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🔍</span>
                <span>Key Insights</span>
              </h3>
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{insight.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setActiveTab('insights')}
                  className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-2"
                >
                  View all insights →
                </button>
              </div>
            </div>

            {/* Season Summary */}
            <div className="lg:col-span-2 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Season 2024/25 Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{trends.totalGameweeks}</div>
                  <div className="text-sm text-gray-600">Gameweeks Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{trends.bestGameweek.points}</div>
                  <div className="text-sm text-gray-600">Best Week</div>
                  <div className="text-xs text-gray-500">GW{trends.bestGameweek.gameweek}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{trends.worstGameweek.points}</div>
                  <div className="text-sm text-gray-600">Worst Week</div>
                  <div className="text-xs text-gray-500">GW{trends.worstGameweek.gameweek}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{trends.currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                  <div className="text-xs text-gray-500">correct predictions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{trends.longestStreak}</div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                  <div className="text-xs text-gray-500">this season</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <AccuracyTracker data={MOCK_PERFORMANCE_DATA} />
        )}

        {activeTab === 'performance' && (
          <PerformanceCharts data={MOCK_PERFORMANCE_DATA} trends={trends} />
        )}

        {activeTab === 'difficulty' && (
          <MatchDifficultyRatings matches={MOCK_MATCH_DIFFICULTIES} />
        )}

        {activeTab === 'headtohead' && (
          <HeadToHeadComparison comparisons={MOCK_HEAD_TO_HEAD} />
        )}

        {activeTab === 'insights' && (
          <InsightsPanel insights={insights} />
        )}
      </div>
    </div>
  );
}