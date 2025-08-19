/**
 * Daily match window check endpoint
 * Runs once daily to determine if polling should be active based on upcoming fixtures
 * More intelligent than polling every 15 minutes when no matches are happening
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/live-scores/match-window-check
 * Daily check for upcoming matches in next 24-48 hours
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const headersList = headers();
    const cronSecret = headersList.get('authorization');
    const vercelCron = headersList.get('x-vercel-cron');
    
    if (process.env.NODE_ENV === 'production' && !vercelCron && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid cron request' },
        { status: 401 }
      );
    }

    console.log('🗓️ Daily match window check initiated...');

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get matches in the next 48 hours
    const upcomingMatches = await prisma.fixture.findMany({
      where: {
        season: '2025-26',
        kickoffTime: {
          gte: now,
          lte: next48Hours
        }
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        kickoffTime: true,
        status: true
      },
      orderBy: {
        kickoffTime: 'asc'
      }
    });

    // Get matches in the next 7 days for planning
    const weekAheadMatches = await prisma.fixture.findMany({
      where: {
        season: '2025-26',
        kickoffTime: {
          gte: next48Hours,
          lte: next7Days
        }
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        kickoffTime: true,
        status: true
      },
      orderBy: {
        kickoffTime: 'asc'
      }
    });

    // Calculate match windows
    const matchWindows = calculateMatchWindows(upcomingMatches);
    
    // Determine if we're currently in a match window
    const currentlyInMatchWindow = matchWindows.some(window => 
      now >= window.startPolling && now <= window.endPolling
    );

    // Find next match window
    const nextMatchWindow = matchWindows.find(window => 
      window.startPolling > now
    );

    const analysis = {
      currentTime: now.toISOString(),
      next48Hours: {
        totalMatches: upcomingMatches.length,
        matchWindows: matchWindows.length,
        currentlyInWindow: currentlyInMatchWindow,
        nextWindowStart: nextMatchWindow?.startPolling?.toISOString() || null
      },
      next7Days: {
        totalMatches: weekAheadMatches.length,
        nextMatchDate: weekAheadMatches[0]?.kickoffTime?.toISOString() || null
      },
      recommendation: {
        shouldEnablePolling: currentlyInMatchWindow || upcomingMatches.length > 0,
        reason: currentlyInMatchWindow 
          ? 'Currently in match window' 
          : upcomingMatches.length > 0 
          ? `${upcomingMatches.length} matches in next 48 hours`
          : 'No matches scheduled soon',
        nextAction: nextMatchWindow 
          ? `Enable polling at ${nextMatchWindow.startPolling.toISOString()}`
          : weekAheadMatches.length > 0
          ? `Check again closer to ${weekAheadMatches[0].kickoffTime.toISOString()}`
          : 'No upcoming matches to schedule'
      }
    };

    console.log(`📊 Match window analysis: ${analysis.next48Hours.totalMatches} matches in 48h, polling ${analysis.recommendation.shouldEnablePolling ? 'RECOMMENDED' : 'NOT NEEDED'}`);

    return NextResponse.json({
      success: true,
      analysis,
      matchWindows,
      upcomingMatches: upcomingMatches.map(match => ({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        kickoff: match.kickoffTime.toISOString(),
        status: match.status
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Match window check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Match window check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate polling windows for upcoming matches
 * Each match gets a polling window from 30 minutes before kickoff to 2.5 hours after
 */
function calculateMatchWindows(matches: any[]) {
  return matches.map(match => {
    const kickoff = new Date(match.kickoffTime);
    const startPolling = new Date(kickoff.getTime() - 30 * 60 * 1000); // 30 minutes before
    const endPolling = new Date(kickoff.getTime() + 2.5 * 60 * 60 * 1000); // 2.5 hours after

    return {
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      kickoff: kickoff.toISOString(),
      startPolling: startPolling.toISOString(),
      endPolling: endPolling.toISOString(),
      windowDuration: '3 hours',
      status: match.status
    };
  });
}