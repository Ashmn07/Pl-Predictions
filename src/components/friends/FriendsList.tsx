'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Friend, removeFriend } from '@/lib/friendsData';

interface FriendsListProps {
  friends: Friend[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  const [sortBy, setSortBy] = useState<'name' | 'rank' | 'points' | 'lastSeen'>('rank');
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const sortedFriends = [...friends].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rank':
        return a.currentRank - b.currentRank;
      case 'points':
        return b.totalPoints - a.totalPoints;
      case 'lastSeen':
        if (!a.lastSeen) return 1;
        if (!b.lastSeen) return -1;
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      default:
        return 0;
    }
  });

  const handleRemoveFriend = async (friendId: string) => {
    setIsRemoving(friendId);
    try {
      await removeFriend(friendId);
      // In real app, this would update the friends list
    } catch (error) {
      console.error('Failed to remove friend:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const getLastSeenText = (lastSeen?: string, isOnline?: boolean) => {
    if (isOnline) return 'Online now';
    if (!lastSeen) return 'Never seen';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInHours = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return lastSeenDate.toLocaleDateString();
  };

  if (friends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
          <p className="text-gray-600 mb-4">
            Connect with other predictors to compare your performance and compete together.
          </p>
          <Link
            href="/friends?tab=find"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-purple-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-purple-700 transition-colors"
          >
            Find Friends
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Friends</h2>
            <p className="text-sm text-gray-600 mt-1">{friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="rank">Rank</option>
              <option value="points">Points</option>
              <option value="name">Name</option>
              <option value="lastSeen">Last Seen</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedFriends.map((friend) => (
          <div key={friend.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar and Online Status */}
                <div className="relative">
                  <div className="text-4xl">{friend.avatar}</div>
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* User Info */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                    {friend.favoriteTeam && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ⚽ {friend.favoriteTeam}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">@{friend.username}</p>
                  <p className="text-xs text-gray-500">
                    {getLastSeenText(friend.lastSeen, friend.isOnline)}
                    {friend.mutualFriends > 0 && (
                      <span className="ml-2">• {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center space-x-6">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Rank:</span> <span className="text-purple-600">#{friend.currentRank}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Points:</span> <span className="text-green-600">{friend.totalPoints}</span>
                  </div>
                </div>

                {/* Action Menu */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/friends/${friend.id}`}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/analytics?compare=${friend.id}`}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    Compare
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    disabled={isRemoving === friend.id}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {isRemoving === friend.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Stats */}
            <div className="mt-3 sm:hidden">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Rank: <span className="text-purple-600 font-medium">#{friend.currentRank}</span></span>
                <span>Points: <span className="text-green-600 font-medium">{friend.totalPoints}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;