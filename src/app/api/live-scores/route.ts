import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getLiveMatches, getLiveMatchWindow } from '@/lib/live-match-utils';
import { initializeBackgroundServices } from '@/lib/startup-initialization';

/**
 * GET /api/live-scores
 * Returns current live match status from database
 * Ensures background polling service is initialized
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔴 Live scores API called');
    
    // Initialize background services if not already running
    await initializeBackgroundServices();
    
    // Get all fixtures from database
    const fixtures = await prisma.fixture.findMany({
      where: {
        season: '2025-26'
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            apiId: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            apiId: true
          }
        }
      },
      orderBy: {
        kickoffTime: 'asc'
      }
    });

    // Transform to Match format for utility functions
    const transformedFixtures = fixtures.map(f => ({
      id: f.id,
      gameweek: f.gameweek,
      kickoff: f.kickoffTime.toISOString(),
      status: f.status,
      homeTeam: { 
        name: f.homeTeam.name, 
        logo: f.homeTeam.logoUrl || '',
        id: f.homeTeam.id
      },
      awayTeam: { 
        name: f.awayTeam.name, 
        logo: f.awayTeam.logoUrl || '',
        id: f.awayTeam.id
      },
      season: f.season,
      homeScore: f.homeScore,
      awayScore: f.awayScore
    }));

    // Get current live window status
    const liveWindow = getLiveMatchWindow(transformedFixtures);
    const liveMatches = getLiveMatches(transformedFixtures);

    console.log(`📊 Live window status: ${liveWindow.isLive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`⚽ Live matches: ${liveMatches.length}`);

    // No API calls made from frontend - background service handles this
    const apiCallMade = false;
    const updatedFixtures: any[] = [];

    console.log('ℹ️ Live scores served from database (background service handles API calls)');

    return NextResponse.json({
      success: true,
      liveWindow: {
        isLive: liveWindow.isLive,
        matchesCount: liveWindow.matchesInWindow.length,
        allMatchesFinished: liveWindow.allMatchesFinished,
        nextMatchStart: liveWindow.nextMatchStart?.toISOString() || null
      },
      apiCall: {
        made: apiCallMade,
        timestamp: new Date().toISOString()
      },
      updates: {
        count: updatedFixtures.length,
        fixtures: updatedFixtures
      }
    });

  } catch (error) {
    console.error('❌ Error in live scores API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live scores',
        liveWindow: { isLive: false, matchesCount: 0, allMatchesFinished: true }
      },
      { status: 500 }
    );
  }
}

/**
 * Map API-Football status codes to our database status
 */
function mapApiStatusToOurStatus(apiStatus: string): string {
  switch (apiStatus) {
    case 'NS':  // Not Started
      return 'SCHEDULED';
    case '1H':  // First Half
    case 'HT':  // Half Time
    case '2H':  // Second Half
    case 'ET':  // Extra Time
    case 'P':   // Penalty
      return 'LIVE';
    case 'FT':  // Full Time
    case 'AET': // After Extra Time
    case 'PEN': // Penalty Finished
      return 'FINISHED';
    case 'SUSP': // Suspended
    case 'INT':  // Interrupted
      return 'SUSPENDED';
    case 'PST':  // Postponed
    case 'CANC': // Cancelled
      return 'POSTPONED';
    default:
      return 'SCHEDULED';
  }
}

/**
 * POST /api/live-scores
 * Manual trigger for live score sync (for testing/admin use)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    console.log('🔄 Manual live score sync triggered');
    
    // Call the GET handler to perform the sync
    const response = await GET(request);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Manual sync completed',
      forced: force,
      ...data
    });
    
  } catch (error) {
    console.error('❌ Error in manual live scores sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync live scores'
      },
      { status: 500 }
    );
  }
}