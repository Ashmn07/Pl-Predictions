import { Match } from '@/types';

/**
 * Check if predictions should be locked for a gameweek
 * Locks 1 hour before the first match of the gameweek starts
 */
export function isGameweekLocked(fixtures: Match[], gameweek: number): boolean {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  if (gameweekFixtures.length === 0) return false;
  
  // Find the earliest kickoff time for this gameweek
  const earliestKickoff = gameweekFixtures
    .map(f => new Date(f.kickoff))
    .sort((a, b) => a.getTime() - b.getTime())[0];
  
  // Lock 1 hour (3600000 ms) before the first match
  const lockTime = new Date(earliestKickoff.getTime() - 3600000);
  const now = new Date();
  
  return now >= lockTime;
}

/**
 * Get the lock time for a gameweek (1 hour before first match)
 */
export function getGameweekLockTime(fixtures: Match[], gameweek: number): Date | null {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  if (gameweekFixtures.length === 0) return null;
  
  const earliestKickoff = gameweekFixtures
    .map(f => new Date(f.kickoff))
    .sort((a, b) => a.getTime() - b.getTime())[0];
  
  return new Date(earliestKickoff.getTime() - 3600000);
}

/**
 * Format time until lock
 */
export function formatTimeUntilLock(lockTime: Date): string {
  const now = new Date();
  const diff = lockTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Locked';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if any match in gameweek has started
 */
export function hasGameweekStarted(fixtures: Match[], gameweek: number): boolean {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  return gameweekFixtures.some(f => 
    f.status === 'LIVE' || 
    f.status === 'FINISHED' || 
    new Date() >= new Date(f.kickoff)
  );
}

/**
 * Check if a gameweek has started (any match kickoff time has passed)
 */
export function hasGameweekStartedByDate(fixtures: Match[], gameweek: number): boolean {
  const now = new Date();
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  return gameweekFixtures.some(f => new Date(f.kickoff) <= now);
}

/**
 * Check if a gameweek is currently live (any match is live or in progress)
 */
export function isGameweekLive(fixtures: Match[], gameweek: number): boolean {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  return gameweekFixtures.some(f => f.status === 'LIVE');
}

/**
 * Check if a gameweek is completely finished (all matches finished)
 */
export function isGameweekCompletelyFinished(fixtures: Match[], gameweek: number): boolean {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  if (gameweekFixtures.length === 0) return false;
  
  return gameweekFixtures.every(f => f.status === 'FINISHED');
}

/**
 * Get the earliest kickoff time for a gameweek
 */
export function getGameweekEarliestKickoff(fixtures: Match[], gameweek: number): Date | null {
  const gameweekFixtures = fixtures.filter(f => f.gameweek === gameweek);
  
  if (gameweekFixtures.length === 0) return null;
  
  const earliestKickoff = gameweekFixtures
    .map(f => new Date(f.kickoff))
    .sort((a, b) => a.getTime() - b.getTime())[0];
    
  return earliestKickoff;
}

/**
 * Get the upcoming gameweek based purely on fixture dates
 * Logic: Find the gameweek where current date is before the first fixture
 */
export function getCurrentGameweek(fixtures: Match[]): number {
  if (fixtures.length === 0) return 1;
  
  const now = new Date();
  
  // Group fixtures by gameweek and sort them
  const gameweekMap = new Map<number, Match[]>();
  fixtures.forEach(fixture => {
    const gw = fixture.gameweek;
    if (!gameweekMap.has(gw)) {
      gameweekMap.set(gw, []);
    }
    gameweekMap.get(gw)!.push(fixture);
  });

  const sortedGameweeks = Array.from(gameweekMap.keys()).sort((a, b) => a - b);
  
  // For each gameweek, find the first (earliest) fixture
  for (const gw of sortedGameweeks) {
    const gwFixtures = gameweekMap.get(gw)!;
    const earliestFixture = gwFixtures
      .map(f => new Date(f.kickoff))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    
    // If current date is before the first fixture of this gameweek, this is our target
    if (now < earliestFixture) {
      return gw;
    }
  }
  
  // If current date is after all fixtures, return the last gameweek
  return Math.max(...sortedGameweeks);
}

/**
 * Get the most recent completed gameweek based on fixture dates
 * Logic: Find the last gameweek where the latest fixture date is before current date
 */
export function getMostRecentGameweek(fixtures: Match[]): number {
  if (fixtures.length === 0) return 1;
  
  const now = new Date();
  
  // Group fixtures by gameweek
  const gameweekMap = new Map<number, Match[]>();
  fixtures.forEach(fixture => {
    const gw = fixture.gameweek;
    if (!gameweekMap.has(gw)) {
      gameweekMap.set(gw, []);
    }
    gameweekMap.get(gw)!.push(fixture);
  });

  const sortedGameweeks = Array.from(gameweekMap.keys()).sort((a, b) => b - a); // Sort descending
  
  // For each gameweek (starting from the latest), find the last (latest) fixture
  for (const gw of sortedGameweeks) {
    const gwFixtures = gameweekMap.get(gw)!;
    const latestFixture = gwFixtures
      .map(f => new Date(f.kickoff))
      .sort((a, b) => b.getTime() - a.getTime())[0]; // Sort descending to get latest
    
    // If current date is after the last fixture of this gameweek, this is our target
    if (now > latestFixture) {
      return gw;
    }
  }
  
  // If current date is before all fixtures, return gameweek 1
  return 1;
}