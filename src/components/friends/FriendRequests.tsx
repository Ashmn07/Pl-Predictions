'use client';

import React, { useState } from 'react';
import { FriendRequest, acceptFriendRequest, declineFriendRequest } from '@/lib/friendsData';

interface FriendRequestsProps {
  requests: FriendRequest[];
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ requests }) => {
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await acceptFriendRequest(requestId);
      // In real app, this would update the requests list
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await declineFriendRequest(requestId);
      // In real app, this would update the requests list
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return requestTime.toLocaleDateString();
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">
            When other users send you friend requests, they&apos;ll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Friend Requests</h2>
        <p className="text-sm text-gray-600 mt-1">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {requests.map((request) => (
          <div key={request.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="text-4xl">{request.fromUser.avatar}</div>

                {/* User Info and Message */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{request.fromUser.name}</h3>
                    <span className="text-sm text-gray-500">@{request.fromUser.username}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>Rank: <span className="text-purple-600 font-medium">#{request.fromUser.currentRank}</span></span>
                    <span>Points: <span className="text-green-600 font-medium">{request.fromUser.totalPoints}</span></span>
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">{getTimeAgo(request.createdAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={processingRequest === request.id}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingRequest === request.id ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleDeclineRequest(request.id)}
                  disabled={processingRequest === request.id}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingRequest === request.id ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {requests.length > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Manage all {requests.length} requests:
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                Accept All
              </button>
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Decline All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;