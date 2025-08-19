'use client';

import React from 'react';
import Link from 'next/link';
import { League, joinLeague } from '@/lib/leagueData';

interface LeagueCardProps {
  league: League;
  showJoinButton?: boolean;
  showManageButton?: boolean;
}

const LeagueCard: React.FC<LeagueCardProps> = ({ 
  league, 
  showJoinButton = false, 
  showManageButton = false 
}) => {
  const [isJoining, setIsJoining] = React.useState(false);

  const handleJoinLeague = async () => {
    setIsJoining(true);
    try {
      await joinLeague(league.id);
      // In real app, would show success message and refresh data
      alert('Successfully joined league!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to join league');
    } finally {
      setIsJoining(false);
    }
  };

  const getTypeColor = () => {
    return league.type === 'private' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getMemberStatus = () => {
    if (!league.maxMembers) return `${league.memberCount} members`;
    return `${league.memberCount}/${league.maxMembers} members`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{league.avatar}</span>
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{league.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor()}`}>
                  {league.type}
                </span>
                <span className="text-xs text-gray-500">
                  Season {league.season}
                </span>
              </div>
            </div>
          </div>
          
          {!league.isActive && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Inactive
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {league.description}
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              👥 {getMemberStatus()}
            </span>
            {league.prize && (
              <span className="text-green-600 text-xs">
                🏆 Prize available
              </span>
            )}
          </div>
        </div>

        {league.joinCode && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-center">
            <span className="text-xs text-gray-600">Join Code: </span>
            <span className="font-mono font-semibold text-sm text-gray-900">
              {league.joinCode}
            </span>
          </div>
        )}
      </div>

      {/* Prize Info */}
      {league.prize && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-gray-200">
          <p className="text-xs text-yellow-800">
            🏆 <strong>Prize:</strong> {league.prize}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between space-x-2">
          <Link
            href={`/leagues/${league.id}`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>

          {showJoinButton && league.isActive && (
            <button
              onClick={handleJoinLeague}
              disabled={isJoining || (league.maxMembers && league.memberCount >= league.maxMembers)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Joining...' : 'Join League'}
            </button>
          )}

          {showManageButton && (
            <Link
              href={`/leagues/${league.id}/manage`}
              className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Manage
            </Link>
          )}
        </div>
      </div>

      {/* Full indicator */}
      {league.maxMembers && league.memberCount >= league.maxMembers && (
        <div className="px-4 py-2 bg-red-50 border-t border-gray-200">
          <p className="text-xs text-red-600 text-center">
            ⚠️ League is full
          </p>
        </div>
      )}
    </div>
  );
};

export default LeagueCard;