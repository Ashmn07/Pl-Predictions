'use client';

import React, { useState } from 'react';
import { MOCK_LEAGUES, MOCK_LEAGUE_INVITATIONS, getLeaguesByUser } from '@/lib/leagueData';
import LeagueCard from '@/components/leagues/LeagueCard';
import CreateLeague from '@/components/leagues/CreateLeague';
import JoinLeague from '@/components/leagues/JoinLeague';
import LeagueInvitations from '@/components/leagues/LeagueInvitations';

const LeaguesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my-leagues' | 'discover' | 'create'>('my-leagues');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Mock current user ID
  const currentUserId = 'user-1';
  const myLeagues = getLeaguesByUser(currentUserId);
  const publicLeagues = MOCK_LEAGUES.filter(l => l.type === 'public').slice(0, 6);
  const pendingInvitations = MOCK_LEAGUE_INVITATIONS.filter(inv => inv.status === 'pending');

  const tabs = [
    { id: 'my-leagues', label: 'My Leagues', count: myLeagues.length },
    { id: 'discover', label: 'Discover', count: publicLeagues.length },
    { id: 'create', label: 'Create League', count: null }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-purple-600 rounded-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Private Leagues</h1>
            <p className="text-green-100">
              Create and join leagues to compete with friends and colleagues
            </p>
          </div>
          <div className="text-6xl opacity-20">🏆</div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <LeagueInvitations invitations={pendingInvitations} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="font-semibold">Create New League</h3>
              <p className="text-sm text-green-100">Start your own prediction league</p>
            </div>
            <div className="text-2xl">➕</div>
          </div>
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="font-semibold">Join with Code</h3>
              <p className="text-sm text-purple-100">Enter a league join code</p>
            </div>
            <div className="text-2xl">🔗</div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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
          {/* My Leagues Tab */}
          {activeTab === 'my-leagues' && (
            <div>
              {myLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No leagues yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first league or join an existing one to get started.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create Your First League
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myLeagues.map((league) => (
                    <LeagueCard key={league.id} league={league} showManageButton />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Discover Tab */}
          {activeTab === 'discover' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Public Leagues</h3>
                <p className="text-gray-600">
                  Join open leagues and compete with predictors from around the world.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicLeagues.map((league) => (
                  <LeagueCard key={league.id} league={league} showJoinButton />
                ))}
              </div>
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <CreateLeague onSuccess={() => setActiveTab('my-leagues')} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateLeague 
              onSuccess={() => {
                setShowCreateModal(false);
                setActiveTab('my-leagues');
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <JoinLeague 
              onSuccess={() => {
                setShowJoinModal(false);
                setActiveTab('my-leagues');
              }}
              onCancel={() => setShowJoinModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaguesPage;