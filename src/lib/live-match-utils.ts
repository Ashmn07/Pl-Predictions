import { Match } from '@/types';

/**
 * Utilities for detecting and managing live matches
 */

export interface LiveMatchWindow {
  isLive: boolean;
  matchesInWindow: Match[];
  nextMatchStart: Date | null;
  allMatchesFinished: boolean;
}

/**
 * Check if a match is currently in its "live window"
 * Live window = kickoff time to kickoff + 120 minutes
 */
export function isMatchInLiveWindow(match: Match): boolean {
  const now = new Date();
  const kickoff = new Date(match.kickoff);
  const endTime = new Date(kickoff.getTime() + 120 * 60 * 1000); // +120 minutes
  
  return now >= kickoff && now <= endTime && match.status !== 'FINISHED';
}

/**
 * Get all matches that are currently in their live window
 */
export function getLiveMatches(fixtures: Match[]): Match[] {
  return fixtures.filter(isMatchInLiveWindow);
}

/**
 * Check if any matches are currently live for a specific gameweek
 */
export function hasLiveMatches(fixtures: Match[], gameweek?: number): boolean {
  const matchesToCheck = gameweek 
    ? fixtures.filter(f => f.gameweek === gameweek)
    : fixtures;
    
  return getLiveMatches(matchesToCheck).length > 0;
}

/**
 * Get the current live match window status
 */
export function getLiveMatchWindow(fixtures: Match[]): LiveMatchWindow {
  const now = new Date();
  const liveMatches = getLiveMatches(fixtures);
  
  // Find next match that hasn't started yet
  const upcomingMatches = fixtures
    .filter(f => new Date(f.kickoff) > now && f.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  
  const nextMatchStart = upcomingMatches.length > 0 
    ? new Date(upcomingMatches[0].kickoff)
    : null;
  
  // Check if all matches for today are finished
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysMatches = fixtures.filter(f => {
    const kickoff = new Date(f.kickoff);
    return kickoff >= today && kickoff < tomorrow;
  });
  
  const allMatchesFinished = todaysMatches.length > 0 && 
    todaysMatches.every(m => m.status === 'FINISHED');
  
  return {
    isLive: liveMatches.length > 0,
    matchesInWindow: liveMatches,
    nextMatchStart,
    allMatchesFinished
  };
}

/**
 * Calculate time until next polling should happen
 * Returns minutes until next 15-minute interval
 */
export function getTimeUntilNextPoll(): number {
  const now = new Date();
  const minutes = now.getMinutes();
  const secondsIntoMinute = now.getSeconds();
  
  // Find next 15-minute mark (0, 15, 30, 45)
  const nextInterval = Math.ceil(minutes / 15) * 15;
  const nextPollMinute = nextInterval === 60 ? 0 : nextInterval;
  
  let minutesUntilNext: number;
  if (nextPollMinute === 0) {
    // Next poll is at top of next hour
    minutesUntilNext = 60 - minutes;
  } else {
    minutesUntilNext = nextPollMinute - minutes;
  }
  
  // Subtract seconds to be precise
  return minutesUntilNext - (secondsIntoMinute / 60);
}

/**
 * Format time remaining until next match or poll
 */
export function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if we should start polling (first match of the day has started)
 */
export function shouldStartPolling(fixtures: Match[]): boolean {
  const window = getLiveMatchWindow(fixtures);
  return window.isLive && !window.allMatchesFinished;
}

/**
 * Check if we should stop polling (all matches finished)
 */
export function shouldStopPolling(fixtures: Match[]): boolean {
  const window = getLiveMatchWindow(fixtures);
  return window.allMatchesFinished || (!window.isLive && window.nextMatchStart === null);
}