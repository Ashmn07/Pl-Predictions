'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { SortOption } from '@/app/leaderboard/page';

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  totalPoints: number;
  currentRank: number;
  previousRank?: number;
  accuracyRate: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  favoriteTeam?: string;
  rank: number;
  rankChange: number;
  gameweekPoints?: number;
  achievements?: Array<{
    achievement: {
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
    };
  }>;
}

interface LeaderboardCardProps {
  user: LeaderboardUser;
  position: number;
  sortBy: SortOption;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, position, sortBy }) => {
  const { data: session } = useSession();
  
  const getRankMovement = (): 'up' | 'down' | 'same' => {
    if (user.rankChange > 0) return 'up';
    if (user.rankChange < 0) return 'down';
    return 'same';
  };
  
  const rankMovement = getRankMovement();
  const isCurrentUser = session?.user?.email?.split('@')[0] === user.username;

  const getRankIcon = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const getRankMovementIcon = () => {
    if (rankMovement === 'up') return <span className="text-green-500 text-xs">↗️</span>;
    if (rankMovement === 'down') return <span className="text-red-500 text-xs">↘️</span>;
    return <span className="text-gray-400 text-xs">➖</span>;
  };

  const getPrimaryValue = () => {
    switch (sortBy) {
      case 'weeklyPoints':
        return `${user.gameweekPoints || 0} pts this week`;
      case 'accuracyRate':
        return `${Math.round(user.accuracyRate)}% accuracy`;
      default:
        return `${user.totalPoints} points`;
    }
  };

  const getSecondaryStats = () => {
    switch (sortBy) {
      case 'weeklyPoints':
        return [
          { label: 'Total', value: `${user.totalPoints} pts` },
          { label: 'Accuracy', value: `${Math.round(user.accuracyRate)}%` }
        ];
      case 'accuracyRate':
        return [
          { label: 'Total', value: `${user.totalPoints} pts` },
          { label: 'This Week', value: `${user.gameweekPoints || 0} pts` }
        ];
      default:
        return [
          { label: 'Weekly', value: `${user.gameweekPoints || 0} pts` },
          { label: 'Accuracy', value: `${Math.round(user.accuracyRate)}%` }
        ];
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${
      isCurrentUser ? 'bg-gradient-to-r from-green-50 to-purple-50 border-l-4 border-green-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        {/* Left side - Rank, Avatar, User Info */}
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div className="flex flex-col items-center min-w-[3rem]">
            <div className={`text-lg font-bold ${
              position <= 3 ? 'text-2xl' : 'text-gray-600'
            }`}>
              {getRankIcon(position)}
            </div>
            {rankMovement !== 'same' && (
              <div className="flex items-center space-x-1">
                {getRankMovementIcon()}
              </div>
            )}
          </div>

          {/* Avatar & User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold ${
                  isCurrentUser ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {user.displayName}
                  {isCurrentUser && <span className="text-sm text-green-600 ml-1">(You)</span>}
                </h3>
                {user.achievements && user.achievements.length > 0 && (
                  <div className="flex space-x-1">
                    {user.achievements.slice(0, 3).map((userAchievement) => (
                      <span
                        key={userAchievement.achievement.id}
                        className="text-xs"
                        title={`${userAchievement.achievement.name}: ${userAchievement.achievement.description}`}
                      >
                        {userAchievement.achievement.icon}
                      </span>
                    ))}
                    {user.achievements.length > 3 && (
                      <span className="text-xs text-gray-400">+{user.achievements.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-3">
                <span>@{user.username}</span>
                {user.favoriteTeam && (
                  <span className="flex items-center space-x-1">
                    <span>⚽</span>
                    <span>{user.favoriteTeam}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="text-right">
          <div className={`text-lg font-bold ${
            isCurrentUser ? 'text-green-700' : 'text-gray-900'
          }`}>
            {getPrimaryValue()}
          </div>
          <div className="flex items-center justify-end space-x-4 mt-1 text-xs text-gray-500">
            {getSecondaryStats().map((stat, statIndex) => (
              <div key={statIndex} className="flex items-center space-x-1">
                <span className="text-gray-400">{stat.label}:</span>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
          
          {/* Additional stats */}
          <div className="flex items-center justify-end space-x-3 mt-1 text-xs text-gray-400">
            <span title="Current Streak">🔥 {user.currentStreak}</span>
            <span title="Predictions Made">📊 {user.totalPredictions}</span>
          </div>
        </div>
      </div>

      {/* Achievements row for current user */}
      {isCurrentUser && user.achievements && user.achievements.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-green-700">Recent Achievements:</span>
            <div className="flex space-x-1">
              {user.achievements.slice(-3).map((userAchievement) => (
                <span
                  key={userAchievement.achievement.id}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    userAchievement.achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                    userAchievement.achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    userAchievement.achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                  title={userAchievement.achievement.description}
                >
                  {userAchievement.achievement.icon} {userAchievement.achievement.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;