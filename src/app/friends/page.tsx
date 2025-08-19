'use client';

import React, { useState } from 'react';
import { getFriends, getPendingRequests, getSocialActivity, getFriendStats } from '@/lib/friendsData';
import FriendsListComponent from '@/components/friends/FriendsList';
import FriendRequestsComponent from '@/components/friends/FriendRequests';
import SocialActivityComponent from '@/components/friends/SocialActivity';
import FriendSearchComponent from '@/components/friends/FriendSearch';

export default function Friends() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'activity' | 'find'>('friends');
  
  const friends = getFriends();
  const pendingRequests = getPendingRequests();
  const socialActivity = getSocialActivity(10);
  const friendStats = getFriendStats();

  const tabs = [
    { 
      id: 'friends' as const, 
      label: 'My Friends', 
      icon: '👥', 
      count: friends.length 
    },
    { 
      id: 'requests' as const, 
      label: 'Requests', 
      icon: '📬', 
      count: pendingRequests.length 
    },
    { 
      id: 'activity' as const, 
      label: 'Activity', 
      icon: '🔔', 
      count: socialActivity.length 
    },
    { 
      id: 'find' as const, 
      label: 'Find Friends', 
      icon: '🔍' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
        <p className="mt-2 text-gray-600">
          Connect with other predictors and see how you compare
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Friends</div>
              <div className="text-2xl font-bold text-gray-900">{friendStats.totalFriends}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-lg">🟢</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Online Now</div>
              <div className="text-2xl font-bold text-green-600">{friendStats.onlineFriends}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-lg">📬</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Pending Requests</div>
              <div className="text-2xl font-bold text-purple-600">{friendStats.pendingRequests}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Mutual Connections</div>
              <div className="text-2xl font-bold text-blue-600">{friendStats.mutualConnections}</div>
            </div>
          </div>
        </div>
      </div>

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
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                  activeTab === tab.id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'friends' && (
          <FriendsListComponent friends={friends} />
        )}

        {activeTab === 'requests' && (
          <FriendRequestsComponent requests={pendingRequests} />
        )}

        {activeTab === 'activity' && (
          <SocialActivityComponent activities={socialActivity} />
        )}

        {activeTab === 'find' && (
          <FriendSearchComponent />
        )}
      </div>
    </div>
  );
}