/**
 * Vercel Cron endpoint for live scores polling
 * Triggered every 15 minutes by Vercel Cron
 * Replaces persistent background service for serverless deployment
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { backgroundPollingControls } from '@/lib/server/live-scores-background';

/**
 * GET /api/live-scores/cron
 * Cron job endpoint for Vercel - polls live scores if needed
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const headersList = headers();
    const cronSecret = headersList.get('authorization');
    const vercelCron = headersList.get('x-vercel-cron');
    
    // For Vercel Cron, check the authorization header or x-vercel-cron header
    if (process.env.NODE_ENV === 'production' && !vercelCron && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid cron request' },
        { status: 401 }
      );
    }

    console.log('🕒 Cron job triggered: Checking if live scores polling is needed...');

    // Check if we should be polling based on current match status
    const pollingCheck = await shouldBePollingLiveScores();
    
    if (!pollingCheck.shouldPoll) {
      console.log(`ℹ️ Skipping poll: ${pollingCheck.reason}`);
      return NextResponse.json({
        success: true,
        action: 'skipped',
        reason: pollingCheck.reason,
        details: pollingCheck.details,
        timestamp: new Date().toISOString()
      });
    }

    // Perform manual poll using background service
    console.log(`🔄 ${pollingCheck.reason} - performing poll...`);
    const pollResult = await backgroundPollingControls.forcePoll();
    
    console.log('✅ Smart cron poll completed successfully');
    
    return NextResponse.json({
      success: true,
      action: 'polled',
      reason: pollingCheck.reason,
      details: pollingCheck.details,
      result: pollResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live-scores/cron
 * Manual trigger for testing cron functionality
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Manual cron trigger for testing...');
    
    // Call the GET handler to perform the same logic
    const response = await GET(request);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Manual cron test completed',
      ...data
    });
    
  } catch (error) {
    console.error('❌ Manual cron test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Manual cron test failed'
      },
      { status: 500 }
    );
  }
}

/**
 * Enhanced match window detection - much smarter than before
 */
async function shouldBePollingLiveScores(): Promise<{ shouldPoll: boolean; reason: string; details: any }> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    const now = new Date();
    const next30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const past15Minutes = new Date(now.getTime() - 15 * 60 * 1000);

    // Check for currently live matches
    const liveMatches = await prisma.fixture.findMany({
      where: {
        status: 'LIVE',
        season: '2025-26'
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        kickoffTime: true,
        status: true
      }
    });

    // Check for matches starting soon (within next 30 minutes)
    const upcomingMatches = await prisma.fixture.findMany({
      where: {
        status: 'SCHEDULED',
        season: '2025-26',
        kickoffTime: {
          gte: now,
          lte: next30Minutes
        }
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        kickoffTime: true,
        status: true
      }
    });

    // Check for matches that might have just finished (within last 15 minutes)
    const recentMatches = await prisma.fixture.findMany({
      where: {
        status: {
          in: ['LIVE', 'FINISHED']
        },
        season: '2025-26',
        kickoffTime: {
          gte: past15Minutes,
          lte: next30Minutes
        }
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        kickoffTime: true,
        status: true
      }
    });

    // Determine if we should poll
    const shouldPoll = liveMatches.length > 0 || 
                      upcomingMatches.length > 0 || 
                      recentMatches.some(m => m.status === 'LIVE');

    // Create detailed reasoning
    let reason = '';
    if (liveMatches.length > 0) {
      reason = `${liveMatches.length} matches currently live`;
    } else if (upcomingMatches.length > 0) {
      const nextMatch = upcomingMatches[0];
      const minutesUntil = Math.round((new Date(nextMatch.kickoffTime).getTime() - now.getTime()) / (1000 * 60));
      reason = `${upcomingMatches.length} matches starting in ${minutesUntil} minutes`;
    } else if (recentMatches.length > 0) {
      reason = `Monitoring ${recentMatches.length} recent matches for completion`;
    } else {
      reason = 'No active or upcoming matches';
    }

    const details = {
      currentTime: now.toISOString(),
      liveMatches: liveMatches.length,
      upcomingIn30Min: upcomingMatches.length,
      recentMatches: recentMatches.length,
      nextMatch: upcomingMatches[0] ? {
        teams: `${upcomingMatches[0].homeTeam} vs ${upcomingMatches[0].awayTeam}`,
        kickoff: upcomingMatches[0].kickoffTime.toISOString()
      } : null
    };

    console.log(`📊 Smart poll decision: ${shouldPoll ? 'YES' : 'NO'} - ${reason}`);
    
    return { shouldPoll, reason, details };

  } catch (error) {
    console.error('❌ Error in smart polling check:', error);
    return { shouldPoll: false, reason: 'Error checking matches', details: { error: error.message } };
  }
}