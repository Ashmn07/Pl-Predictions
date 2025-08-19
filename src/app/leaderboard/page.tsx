'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import TopPerformers from '@/components/leaderboard/TopPerformers';

export type SortOption = 'totalPoints' | 'weeklyPoints' | 'accuracyRate';
export type FilterOption = 'all' | 'top10' | 'friends' | 'rising';

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
}

export default function Leaderboard() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<SortOption>('totalPoints');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
        
        // Find current user in the leaderboard
        if (session?.user?.email) {
          const user = data.find((u: LeaderboardUser) => u.username === session.user?.email?.split('@')[0]);
          setCurrentUser(user || null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [session]);

  const getFilteredUsers = (): LeaderboardUser[] => {
    switch (filterBy) {
      case 'top10':
        return users.slice(0, 10);
      case 'friends':
        // For now, just show users near current user
        if (currentUser) {
          const currentUserIndex = users.findIndex(u => u.id === currentUser.id);
          const start = Math.max(0, currentUserIndex - 2);
          const end = Math.min(users.length, currentUserIndex + 3);
          return users.slice(start, end);
        }
        return users.slice(0, 5);
      case 'rising':
        return users.filter(user => user.rankChange > 0);
      default:
        return users;
    }
  };

  const getUserRankMovement = (user: LeaderboardUser): 'up' | 'down' | 'same' => {
    if (user.rankChange > 0) return 'up';
    if (user.rankChange < 0) return 'down';
    return 'same';
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-2 text-gray-600">
          See how you rank against other predictors this season
        </p>
      </div>

      {/* Top Performers Section */}
      <TopPerformers />

      {/* Your Position Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border-2 border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Current Position</h3>
              <p className="text-sm text-gray-600">Keep predicting to climb the ranks!</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">#{currentUser.currentRank || currentUser.rank}</span>
                {getUserRankMovement(currentUser) === 'up' && (
                  <span className="text-green-500 text-sm">↗️ +{Math.abs(currentUser.rankChange)}</span>
                )}
                {getUserRankMovement(currentUser) === 'down' && (
                  <span className="text-red-500 text-sm">↘️ -{Math.abs(currentUser.rankChange)}</span>
                )}
                {getUserRankMovement(currentUser) === 'same' && (
                  <span className="text-gray-500 text-sm">➖</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{currentUser.totalPoints} points</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <LeaderboardFilters 
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
      />

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {filterBy === 'all' && `All Predictors`}
                {filterBy === 'top10' && `Top 10 Predictors`}
                {filterBy === 'friends' && `Your Circle`}
                {filterBy === 'rising' && `Rising Stars`}
              </h2>
              <p className="text-sm text-gray-500">Current Season</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredUsers.length} predictor{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user, index) => (
            <LeaderboardCard 
              key={user.id} 
              user={user} 
              position={sortBy === 'totalPoints' ? user.currentRank : index + 1}
              sortBy={sortBy}
            />
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500">No predictors match your current filter</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters to see more results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}