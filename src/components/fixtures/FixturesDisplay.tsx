'use client';

import React from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { formatMatchTime, formatMatchDate } from '@/lib/date-utils';

interface FixturesDisplayProps {
  fixtures: Match[];
  gameweek: number;
}

const FixturesDisplay: React.FC<FixturesDisplayProps> = ({ fixtures, gameweek }) => {
  const getStatusBadge = (match: Match) => {
    switch (match.status) {
      case 'FINISHED':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            ✅ Finished
          </span>
        );
      case 'LIVE':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            🔴 Live
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            ⏰ Scheduled
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreDisplay = (match: Match) => {
    if (match.homeScore !== null && match.awayScore !== null) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
            {match.homeScore}
          </div>
          <div className="text-lg font-bold text-gray-400">-</div>
          <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
            {match.awayScore}
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-gray-400 font-medium">
        vs
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Gameweek {gameweek} Fixtures
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              View all matches for this gameweek
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {fixtures.length} matches
            </div>
            <div className="text-xs text-gray-500">
              this gameweek
            </div>
          </div>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="grid grid-cols-1 gap-4">
        {fixtures.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* Match Date/Time Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {formatMatchDate(match.kickoff)} • {formatMatchTime(match.kickoff)}
                </span>
                {getStatusBadge(match)}
              </div>
            </div>

            {/* Teams and Score */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img 
                        src={match.homeTeam.logo} 
                        alt={`${match.homeTeam.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                        {match.homeTeam.name.substring(0, 3).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {match.homeTeam.name}
                    </div>
                  </div>
                </div>

                {/* Score or VS */}
                <div className="flex-shrink-0 mx-6">
                  {getScoreDisplay(match)}
                </div>

                {/* Away Team */}
                <div className="flex-1">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {match.awayTeam.name}
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img 
                        src={match.awayTeam.logo} 
                        alt={`${match.awayTeam.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold">
                        {match.awayTeam.name.substring(0, 3).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(match.venue || match.referee) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {match.venue && <div>📍 {match.venue}</div>}
                    {match.referee && <div>👨‍⚖️ {match.referee}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-lg p-6 border border-gray-200 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🎯 Ready to make predictions?
        </h3>
        <p className="text-gray-600 mb-4">
          Head over to the Predictions page to submit your predictions for these matches
        </p>
        <Link
          href="/predictions"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-purple-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-purple-700 transition-colors"
        >
          Go to Predictions
        </Link>
      </div>
    </div>
  );
};

export default FixturesDisplay;