'use client';

import React from 'react';
import Link from 'next/link';
import { SocialActivity } from '@/lib/friendsData';

interface SocialActivityProps {
  activities: SocialActivity[];
}

const SocialActivityComponent: React.FC<SocialActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: SocialActivity['type']) => {
    switch (type) {
      case 'friend_added': return '🤝';
      case 'prediction_made': return '⚽';
      case 'achievement_unlocked': return '🏆';
      case 'rank_improved': return '📈';
      case 'league_joined': return '👥';
      default: return '📢';
    }
  };

  const getActivityColor = (type: SocialActivity['type']) => {
    switch (type) {
      case 'friend_added': return 'text-blue-600 bg-blue-100';
      case 'prediction_made': return 'text-green-600 bg-green-100';
      case 'achievement_unlocked': return 'text-yellow-600 bg-yellow-100';
      case 'rank_improved': return 'text-purple-600 bg-purple-100';
      case 'league_joined': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
          <p className="text-gray-600">
            Activity from your friends will appear here. Add more friends to see their updates!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Friend Activity</h2>
        <p className="text-sm text-gray-600 mt-1">See what your friends have been up to</p>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              {/* Activity Type Icon */}
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                <span className="text-sm">{getActivityIcon(activity.type)}</span>
              </div>

              {/* User Avatar */}
              <div className="text-2xl">{activity.userAvatar}</div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.userName}</span>{' '}
                      <span>{activity.description}</span>
                    </p>
                    
                    {/* Activity Details */}
                    {activity.details && (
                      <div className="mt-1">
                        {activity.type === 'rank_improved' && activity.details.rank && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Rank #{activity.details.rank} • {activity.details.points} points
                          </div>
                        )}
                        
                        {activity.type === 'achievement_unlocked' && activity.details.achievement && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🏆 {activity.details.achievement}
                          </div>
                        )}
                        
                        {activity.type === 'prediction_made' && activity.details.prediction && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ⚽ {activity.details.prediction}
                          </div>
                        )}
                        
                        {activity.type === 'league_joined' && activity.details.leagueName && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            👥 {activity.details.leagueName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {activities.length >= 10 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button className="w-full text-sm text-green-600 hover:text-green-700 font-medium py-2">
            Load more activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialActivityComponent;