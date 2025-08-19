'use client';

import React, { useState, useEffect } from 'react';
import { Match } from '@/types';
import { useLiveScoresSSE } from '@/hooks/useLiveScoresSSE';
import { isMatchInLiveWindow } from '@/lib/live-match-utils';

interface LiveMatchIndicatorProps {
  match: Match;
  showScores?: boolean;
  showStatus?: boolean;
  className?: string;
}

/**
 * Component that displays live match indicators and auto-updating scores
 */
export const LiveMatchIndicator: React.FC<LiveMatchIndicatorProps> = ({
  match,
  showScores = true,
  showStatus = true,
  className = ''
}) => {
  const { hasLiveMatches, getMatchUpdate, lastUpdate, getLiveMatch } = useLiveScoresSSE({
    autoConnect: true
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [displayScores, setDisplayScores] = useState({
    home: match.homeScore,
    away: match.awayScore
  });

  // Check if this specific match is in live window
  const isLive = isMatchInLiveWindow(match);
  const matchUpdate = getMatchUpdate(match.id);

  // Handle score updates with animation
  useEffect(() => {
    if (matchUpdate && matchUpdate.scoreChanged) {
      setIsAnimating(true);
      
      // Update scores after brief delay for animation
      setTimeout(() => {
        setDisplayScores({
          home: matchUpdate.homeScore,
          away: matchUpdate.awayScore
        });
      }, 150);

      // Clear animation after full cycle
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  }, [matchUpdate]);

  // Use updated scores if available, otherwise fall back to match scores
  const homeScore = matchUpdate?.homeScore ?? displayScores.home ?? match.homeScore;
  const awayScore = matchUpdate?.awayScore ?? displayScores.away ?? match.awayScore;
  const status = matchUpdate?.status ?? match.status;

  const getStatusBadge = () => {
    if (!showStatus) return null;

    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            🔴 LIVE
          </span>
        );
      case 'FINISHED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            ✅ FT
          </span>
        );
      case 'SCHEDULED':
        if (isLive) {
          return (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              ⏰ Starting Soon
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            ⏰ {new Date(match.kickoff).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getScoreDisplay = () => {
    if (!showScores || (homeScore === null && awayScore === null)) {
      return null;
    }

    const scoreClasses = `
      transition-all duration-300 font-bold text-lg
      ${isAnimating ? 'scale-110 text-green-600' : 'scale-100'}
      ${status === 'LIVE' ? 'text-red-600' : 'text-gray-900'}
    `;

    return (
      <div className={`flex items-center space-x-2 ${scoreClasses}`}>
        <span className="w-8 text-center">{homeScore ?? 0}</span>
        <span className="text-gray-400">-</span>
        <span className="w-8 text-center">{awayScore ?? 0}</span>
      </div>
    );
  };

  const getLiveIndicator = () => {
    if (!isLive && status !== 'LIVE') return null;

    return (
      <div className="flex items-center space-x-1 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">LIVE</span>
      </div>
    );
  };

  const getLastUpdateInfo = () => {
    if (!lastUpdate || !isLive) return null;

    const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    const minutes = Math.floor(timeSinceUpdate / 60);
    const seconds = timeSinceUpdate % 60;

    return (
      <div className="text-xs text-gray-500">
        Updated {minutes > 0 ? `${minutes}m` : `${seconds}s`} ago
      </div>
    );
  };

  return (
    <div className={`live-match-indicator ${className}`}>
      <div className="flex items-center justify-between space-x-2">
        {/* Live indicator */}
        {getLiveIndicator()}
        
        {/* Score display */}
        {getScoreDisplay()}
        
        {/* Status badge */}
        {getStatusBadge()}
      </div>
      
      {/* Last update info for live matches */}
      {getLastUpdateInfo()}
      
      {/* Animation overlay for score changes */}
      {isAnimating && (
        <div className="absolute inset-0 bg-green-100 bg-opacity-50 rounded animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

/**
 * Simple live badge component for minimal displays
 */
export const LiveBadge: React.FC<{ match: Match }> = ({ match }) => {
  const isLive = isMatchInLiveWindow(match) || match.status === 'LIVE';
  
  if (!isLive) return null;
  
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
      🔴
    </span>
  );
};

/**
 * Live scores summary component
 */
export const LiveScoresSummary: React.FC = () => {
  const { liveWindow, recentUpdates, hasLiveMatches, lastUpdate, pollingActive } = useLiveScoresSSE({ autoConnect: true });

  if (!hasLiveMatches) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-800">
            {liveWindow?.matchesCount || 0} matches live
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-red-600">
          {pollingActive && (
            <span className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
              <span>Auto-updating</span>
            </span>
          )}
          
          {lastUpdate && (
            <span>
              Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 60000)}m ago
            </span>
          )}
        </div>
      </div>
      
      {recentUpdates.length > 0 && (
        <div className="mt-2 text-xs text-red-700">
          {recentUpdates.filter(u => u.scoreChanged).length} recent score changes
        </div>
      )}
    </div>
  );
};