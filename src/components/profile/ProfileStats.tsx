'use client';

import React from 'react';
import { LeaderboardUser } from '@/lib/mockUsers';
import { UserStats } from '@/lib/storage';

interface ProfileStatsProps {
  user: LeaderboardUser;
  userStats?: UserStats;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const stats = [
    {
      category: 'Performance',
      items: [
        { label: 'Total Points Scored', value: user.totalPoints, icon: '🏆' },
        { label: 'Current Season Rank', value: `#${user.currentRank}`, icon: '🥇' },
        { label: 'Accuracy Rate', value: `${user.accuracyRate}%`, icon: '🎯' },
        { label: 'Predictions Made', value: user.predictionsMade, icon: '📊' }
      ]
    },
    {
      category: 'Weekly Performance',
      items: [
        { label: 'Points This Week', value: user.weeklyPoints, icon: '📈' },
        { label: 'Best Single Week', value: user.bestWeek, icon: '🌟' },
        { label: 'Worst Single Week', value: user.worstWeek, icon: '📉' },
        { label: 'Rank Change', value: user.previousRank - user.currentRank > 0 ? `+${user.previousRank - user.currentRank}` : user.previousRank - user.currentRank, icon: '📊' }
      ]
    },
    {
      category: 'Streaks & Consistency',
      items: [
        { label: 'Current Streak', value: user.currentStreak, icon: '🔥' },
        { label: 'Longest Streak', value: user.longestStreak, icon: '⚡' },
        { label: 'Achievements Unlocked', value: user.achievements.length, icon: '🏅' },
        { label: 'Days Since Joining', value: Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24)), icon: '📅' }
      ]
    }
  ];

  const achievements = [
    {
      category: 'Achievement Progress',
      items: [
        { 
          label: 'Common Achievements', 
          value: user.achievements.filter(a => a.rarity === 'common').length,
          total: user.achievements.length,
          color: 'green'
        },
        { 
          label: 'Rare Achievements', 
          value: user.achievements.filter(a => a.rarity === 'rare').length,
          total: user.achievements.length,
          color: 'blue'
        },
        { 
          label: 'Epic Achievements', 
          value: user.achievements.filter(a => a.rarity === 'epic').length,
          total: user.achievements.length,
          color: 'purple'
        },
        { 
          label: 'Legendary Achievements', 
          value: user.achievements.filter(a => a.rarity === 'legendary').length,
          total: user.achievements.length,
          color: 'yellow'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      {stats.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-grow">
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    <div className="text-sm text-gray-600">{item.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Achievement Progress */}
      {achievements.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${item.color}-500`}
                    style={{ width: `${Math.min(100, (item.value / Math.max(item.total, 1)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.value} of {item.total} total achievements
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Detailed Achievement Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-xl font-bold text-green-700">
              {user.achievements.filter(a => a.category === 'accuracy').length}
            </div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-xl font-bold text-blue-700">
              {user.achievements.filter(a => a.category === 'volume').length}
            </div>
            <div className="text-sm text-gray-600">Volume</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-xl font-bold text-orange-700">
              {user.achievements.filter(a => a.category === 'streak').length}
            </div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-xl font-bold text-purple-700">
              {user.achievements.filter(a => a.category === 'special').length}
            </div>
            <div className="text-sm text-gray-600">Special</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;