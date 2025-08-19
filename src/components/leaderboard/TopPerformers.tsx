'use client';

import React, { useState, useEffect } from 'react';

interface TopUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  totalPoints: number;
  accuracyRate: number;
  currentStreak: number;
  gameweekPoints?: number;
}

const TopPerformers: React.FC = () => {
  const [topThree, setTopThree] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=3');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setTopThree(data.slice(0, 3));
        } else {
          // No users yet, show placeholder
          setTopThree([]);
        }
      } catch (error) {
        console.error('Error fetching top performers:', error);
        setTopThree([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  const getPodiumHeight = (position: number) => {
    if (position === 1) return 'h-24';
    if (position === 2) return 'h-20';
    return 'h-16';
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    return '🥉';
  };

  const getBgGradient = (position: number) => {
    if (position === 1) return 'from-yellow-100 to-yellow-200 border-yellow-300';
    if (position === 2) return 'from-gray-100 to-gray-200 border-gray-300';
    return 'from-orange-100 to-orange-200 border-orange-300';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading top performers...</p>
        </div>
      </div>
    );
  }

  if (topThree.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Top Performers</h2>
          <p className="text-gray-600">No predictions made yet. Be the first to start predicting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
          <span>🏆</span>
          <span>Top Performers</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">This season&apos;s prediction champions</p>
      </div>

      {/* Podium Display */}
      <div className="flex items-end justify-center space-x-8 mb-6">
        {/* Second Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">
              {topThree[1].displayName ? topThree[1].displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className={`${getPodiumHeight(2)} ${getBgGradient(2)} rounded-t-lg border-2 flex flex-col items-center justify-center px-4 min-w-[100px]`}>
              <div className="text-2xl mb-1">{getMedalIcon(2)}</div>
              <div className="text-sm font-bold text-gray-800">{topThree[1].displayName || topThree[1].username}</div>
              <div className="text-xs text-gray-600">{topThree[1].totalPoints} pts</div>
            </div>
          </div>
        )}

        {/* First Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-2">
              {topThree[0].displayName ? topThree[0].displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className={`${getPodiumHeight(1)} ${getBgGradient(1)} rounded-t-lg border-2 flex flex-col items-center justify-center px-4 min-w-[120px] relative`}>
              <div className="absolute -top-3 text-lg">👑</div>
              <div className="text-3xl mb-1">{getMedalIcon(1)}</div>
              <div className="text-sm font-bold text-gray-800">{topThree[0].displayName || topThree[0].username}</div>
              <div className="text-xs text-gray-600">{topThree[0].totalPoints} pts</div>
            </div>
          </div>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center">
            <div className="text-3xl mb-2">
              {topThree[2].displayName ? topThree[2].displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className={`${getPodiumHeight(3)} ${getBgGradient(3)} rounded-t-lg border-2 flex flex-col items-center justify-center px-4 min-w-[100px]`}>
              <div className="text-xl mb-1">{getMedalIcon(3)}</div>
              <div className="text-sm font-bold text-gray-800">{topThree[2].displayName || topThree[2].username}</div>
              <div className="text-xs text-gray-600">{topThree[2].totalPoints} pts</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${topThree.length}, 1fr)` }}>
        {topThree.map((user, index) => (
          <div key={user.id} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              {index === 0 ? '🔥 Leader' : index === 1 ? '📈 Challenger' : '🌟 Rising'}
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium">{Math.round(user.accuracyRate)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Streak:</span>
                <span className="font-medium">{user.currentStreak}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{user.totalPoints} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Think you can do better? Make your predictions and climb the ranks!
        </p>
        <div className="flex justify-center space-x-3">
          <a 
            href="/predictions"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
          >
            Make Predictions
          </a>
          <a 
            href="/profile"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            View My Stats
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopPerformers;