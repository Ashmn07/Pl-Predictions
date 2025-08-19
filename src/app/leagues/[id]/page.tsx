'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_LEAGUES, MOCK_LEAGUE_MEMBERS, leaveLeague, inviteToLeague } from '@/lib/leagueData';
// Removed mock users dependency

const LeagueDetailPage: React.FC = () => {
  const params = useParams();
  const leagueId = params.id as string;
  
  const league = MOCK_LEAGUES.find(l => l.id === leagueId);
  const members = MOCK_LEAGUE_MEMBERS[leagueId] || [];
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'members' | 'rules'>('overview');

  if (!league) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">League not found</h2>
        <p className="text-gray-600">The league you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const handleLeaveLeague = async () => {
    if (!confirm('Are you sure you want to leave this league?')) return;
    
    setIsLeaving(true);
    try {
      await leaveLeague(league.id);
      alert('Successfully left the league');
    } catch (error) {
      alert('Failed to leave league');
    } finally {
      setIsLeaving(false);
    }
  };

  const currentUserMember = members.find(m => m.userId === 'user-1');
  const isOwner = currentUserMember?.role === 'owner';
  const isAdmin = currentUserMember?.role === 'admin' || isOwner;

  return (
    <div className="space-y-6">
      {/* League Header */}
      <div className="bg-gradient-to-r from-green-600 to-purple-600 rounded-lg text-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-4xl">{league.avatar}</span>
              <div>
                <h1 className="text-2xl font-bold">{league.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    league.type === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {league.type}
                  </span>
                  <span className="text-sm text-green-100">Season {league.season}</span>
                  <span className="text-sm text-green-100">👥 {league.memberCount} members</span>
                </div>
              </div>
            </div>
            <p className="text-green-100 max-w-2xl">{league.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                Invite Members
              </button>
            )}
            
            {currentUserMember && !isOwner && (
              <button
                onClick={handleLeaveLeague}
                disabled={isLeaving}
                className="px-4 py-2 bg-red-500 bg-opacity-80 text-white rounded-lg hover:bg-opacity-100 transition-colors disabled:opacity-50"
              >
                {isLeaving ? 'Leaving...' : 'Leave League'}
              </button>
            )}
          </div>
        </div>

        {/* Join Code */}
        {league.joinCode && isAdmin && (
          <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <p className="text-sm text-green-100 mb-1">Share this code to invite others:</p>
            <div className="flex items-center space-x-2">
              <code className="font-mono text-lg font-bold text-white">{league.joinCode}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(league.joinCode!)}
                className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded hover:bg-opacity-30"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', count: null },
              { id: 'leaderboard', label: 'Leaderboard', count: members.length },
              { id: 'members', label: 'Members', count: league.memberCount },
              { id: 'rules', label: 'Rules', count: league.rules?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{league.memberCount}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <div className="text-sm text-gray-600">Gameweeks</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">87</div>
                  <div className="text-sm text-gray-600">Avg Points</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">72%</div>
                  <div className="text-sm text-gray-600">Avg Accuracy</div>
                </div>
              </div>

              {/* Prize Information */}
              {league.prize && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="font-semibold text-yellow-800">League Prize</h3>
                  </div>
                  <p className="text-yellow-700">{league.prize}</p>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { user: 'Alex Chen', action: 'made predictions for Gameweek 16', time: '2h ago', avatar: '👨‍💼' },
                    { user: 'Sarah Johnson', action: 'climbed to 2nd place', time: '1d ago', avatar: '👩‍💻' },
                    { user: 'Mike Brown', action: 'joined the league', time: '3d ago', avatar: '👨‍🎨' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{activity.avatar}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">League Standings</h3>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {member.currentRank}
                      </div>
                      <div className="text-2xl">{member.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.displayName}</h4>
                        <p className="text-sm text-gray-600">@{member.username}</p>
                      </div>
                      {member.role !== 'member' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{member.points} pts</div>
                      <div className="text-sm text-gray-600">{member.accuracy}% accuracy</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">League Members</h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Invite Members
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div key={member.userId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{member.avatar}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.displayName}</h4>
                          <p className="text-sm text-gray-600">@{member.username}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 
                              member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-green-600 font-semibold">{member.points} pts</div>
                        <div className="text-gray-600">Rank #{member.currentRank}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">League Rules</h3>
              {league.rules && league.rules.length > 0 ? (
                <div className="space-y-2">
                  {league.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-500 font-bold mt-0.5">{index + 1}.</span>
                      <span className="text-gray-900">{rule}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No specific rules have been set for this league.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Friends</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select friends to invite:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-gray-500 text-sm">Invite functionality will be implemented when user management is added.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal message (optional):
                </label>
                <textarea
                  placeholder="Join our league! It&apos;s going to be fun..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Invitations sent!');
                    setShowInviteModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Send Invites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueDetailPage;