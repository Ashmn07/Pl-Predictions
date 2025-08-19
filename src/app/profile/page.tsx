'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePredictions } from '@/contexts/PredictionContext';
// Simplified profile page without mock data dependencies

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats'>('overview');
  const { data: session } = useSession();
  const { userStats } = usePredictions();

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '👤' },
    { id: 'achievements' as const, label: 'Achievements', icon: '🏆' },
    { id: 'stats' as const, label: 'Detailed Stats', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Your profile and prediction statistics
        </p>
      </div>

      {/* Profile Header */}
      {session?.user && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{session.user.name || 'Anonymous User'}</h2>
              <p className="text-gray-600">{session.user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-green-600 font-medium">{userStats.totalPoints} points</span>
                <span className="text-sm text-purple-600 font-medium">Rank #{userStats.currentRank || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
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
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>📈</span>
                <span>Quick Stats</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">#{userStats.currentRank || '-'}</div>
                  <div className="text-sm text-gray-600">Current Rank</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userStats.accuracyRate}%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{userStats.predictionsMade}</div>
                  <div className="text-sm text-gray-600">Predictions Made</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🏆</span>
                <span>Recent Achievements</span>
              </h3>
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-500">Achievements system coming soon</p>
                <p className="text-sm text-gray-400 mt-1">Keep making predictions to unlock achievements!</p>
              </div>
            </div>

            {/* Weekly Performance */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">Performance charts coming soon</p>
                <p className="text-sm text-gray-400 mt-1">Track your prediction accuracy over time</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-500">Achievements system coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Unlock badges by completing prediction challenges</p>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">#{userStats.currentRank || '-'}</div>
                <div className="text-sm text-gray-600">Current Rank</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.predictionsMade}</div>
                <div className="text-sm text-gray-600">Predictions Made</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{userStats.accuracyRate}%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}