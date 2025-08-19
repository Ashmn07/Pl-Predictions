'use client';

import React, { useState } from 'react';
import { LeagueInvitation, respondToLeagueInvitation } from '@/lib/leagueData';

interface LeagueInvitationsProps {
  invitations: LeagueInvitation[];
}

const LeagueInvitations: React.FC<LeagueInvitationsProps> = ({ invitations }) => {
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const handleInvitationResponse = async (invitationId: string, response: 'accept' | 'decline') => {
    setProcessingInvitation(invitationId);
    try {
      await respondToLeagueInvitation(invitationId, response);
      // In real app, would refresh invitations list
      alert(`Successfully ${response}ed invitation!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : `Failed to ${response} invitation`);
    } finally {
      setProcessingInvitation(null);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours <= 0) return 'Expired';
    if (diffInHours < 24) return `${diffInHours}h left`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d left`;
  };

  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">League Invitations</h2>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {invitations.length} pending
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          You have been invited to join these leagues
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{invitation.leagueName}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {formatTimeRemaining(invitation.expiresAt)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Invited by <span className="font-medium">{invitation.fromUserName}</span>
                </p>

                {invitation.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Invited on {new Date(invitation.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                  disabled={processingInvitation === invitation.id}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingInvitation === invitation.id ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                  disabled={processingInvitation === invitation.id}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingInvitation === invitation.id ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {invitations.length > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Quick actions for all {invitations.length} invitations:
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

export default LeagueInvitations;