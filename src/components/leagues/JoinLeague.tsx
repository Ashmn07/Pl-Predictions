'use client';

import React, { useState } from 'react';
import { MOCK_LEAGUES, joinLeague, searchLeagues } from '@/lib/leagueData';
import LeagueCard from './LeagueCard';

interface JoinLeagueProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const JoinLeague: React.FC<JoinLeagueProps> = ({ onSuccess, onCancel }) => {
  const [activeMethod, setActiveMethod] = useState<'code' | 'search'>('code');
  const [joinCode, setJoinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(MOCK_LEAGUES.filter(l => l.type === 'public').slice(0, 3));
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }

    setIsJoining(true);
    try {
      // Find league by join code
      const league = MOCK_LEAGUES.find(l => l.joinCode === joinCode.toUpperCase());
      if (!league) {
        throw new Error('Invalid join code');
      }

      await joinLeague(league.id, joinCode.toUpperCase());
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join league');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchLeagues(query);
    setSearchResults(results);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Join a League</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Method Selection */}
      <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveMethod('code')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeMethod === 'code'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔗 Join with Code
        </button>
        <button
          onClick={() => setActiveMethod('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeMethod === 'search'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔍 Search Leagues
        </button>
      </div>

      {/* Join with Code */}
      {activeMethod === 'code' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Enter the join code provided by the league creator to join a private league.
            </p>
            
            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  League Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="Enter 6-character code (e.g., ABC123)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isJoining || !joinCode.trim()}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join League'}
              </button>
            </form>
          </div>

          {/* Example codes for demo */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Try these demo codes:</h4>
            <div className="flex flex-wrap gap-2">
              {MOCK_LEAGUES
                .filter(l => l.joinCode)
                .map(league => (
                  <button
                    key={league.id}
                    onClick={() => setJoinCode(league.joinCode!)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-mono rounded hover:bg-blue-200"
                  >
                    {league.joinCode}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Leagues */}
      {activeMethod === 'search' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Search and join public leagues that are open to everyone.
            </p>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search leagues by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-600">
                  {searchQuery ? 'No leagues found matching your search.' : 'Start typing to search for leagues.'}
                </p>
              </div>
            ) : (
              searchResults.map(league => (
                <div key={league.id} className="border border-gray-200 rounded-lg">
                  <LeagueCard league={league} showJoinButton />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinLeague;