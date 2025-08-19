import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiFootball, CURRENT_SEASON, APIFootballFixture, APIFootballTeam } from '@/lib/football-api';

// Map API-Football status to our FixtureStatus enum
function mapFixtureStatus(apiStatus: string): 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' {
  switch (apiStatus) {
    case 'NS': case 'TBD': return 'SCHEDULED';
    case '1H': case '2H': case 'HT': case 'ET': case 'BT': case 'P': case 'SUSP': case 'INT': return 'LIVE';
    case 'FT': case 'AET': case 'PEN': return 'FINISHED';
    case 'PST': return 'POSTPONED';
    case 'CANC': case 'ABD': return 'CANCELLED';
    default: return 'SCHEDULED';
  }
}

// Extract gameweek number from API round string (e.g., "Regular Season - 15" -> 15)
function extractGameweek(round: string): number {
  const match = round.match(/Regular Season - (\d+)/);
  return match ? parseInt(match[1]) : 1;
}

// POST /api/admin/sync-fixtures - Daily sync of fixtures from API-Football
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting daily fixtures sync...');
    
    // Track API usage for the day
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    let apiSync = await prisma.apiSync.findUnique({
      where: { type: 'fixtures' }
    });
    
    if (!apiSync) {
      apiSync = await prisma.apiSync.create({
        data: { type: 'fixtures', apiCalls: 0 }
      });
    }
    
    // Reset daily counter if it's a new day
    const lastSyncDate = new Date(apiSync.lastSync);
    lastSyncDate.setHours(0, 0, 0, 0);
    
    if (lastSyncDate < today) {
      apiSync = await prisma.apiSync.update({
        where: { type: 'fixtures' },
        data: { apiCalls: 0, lastSync: new Date() }
      });
    }
    
    // Check if we're approaching the daily limit (save some calls for live scoring)
    if (apiSync.apiCalls >= 70) { // Reserve 30 calls for live scoring
      console.log('⚠️ Approaching daily API limit, skipping sync');
      return NextResponse.json({
        success: false,
        message: 'Approaching daily API limit',
        apiCalls: apiSync.apiCalls
      }, { status: 429 });
    }

    // Step 1: Check if teams exist
    const teamCount = await prisma.team.count();
    if (teamCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'No teams found in database. Please sync teams first using the "Sync Teams" button.',
        needsTeamsSync: true
      }, { status: 400 });
    }
    
    // Step 2: Get team mappings from database
    const teams = await prisma.team.findMany({
      select: { id: true, apiId: true }
    });
    
    const teamMappings: { [apiId: number]: string } = {};
    teams.forEach(team => {
      teamMappings[team.apiId] = team.id;
    });
    
    console.log(`📋 Found ${teamCount} teams in database`);
    
    // Step 3: Get fixtures from API
    let apiCallCount = apiSync.apiCalls;
    console.log('⚽ Fetching Premier League fixtures...');
    
    const fixturesResponse = await apiFootball.getPremierLeagueFixtures();
    apiCallCount++; // Count this API call
    
    // Step 4: Create/update fixtures
    console.log('📅 Creating fixtures...');
    let updatedCount = 0;
    let newCount = 0;
    
    for (const fixtureData of fixturesResponse.response) {
      const homeTeamId = teamMappings[fixtureData.teams.home.id];
      const awayTeamId = teamMappings[fixtureData.teams.away.id];
      
      if (!homeTeamId || !awayTeamId) {
        console.warn(`⚠️ Unknown team for fixture ${fixtureData.fixture.id}`);
        continue;
      }
      
      const gameweek = extractGameweek(fixtureData.league.round);
      const status = mapFixtureStatus(fixtureData.fixture.status.short);
      
      const existingFixture = await prisma.fixture.findUnique({
        where: { apiId: fixtureData.fixture.id }
      });
      
      const fixtureData_obj = {
        gameweek,
        season: `${CURRENT_SEASON}-${(CURRENT_SEASON + 1).toString().slice(-2)}`, // e.g., "2025-26"
        homeTeamId,
        awayTeamId,
        kickoffTime: new Date(fixtureData.fixture.date),
        status,
        venue: fixtureData.fixture.venue?.name,
        referee: fixtureData.fixture.referee,
        homeScore: fixtureData.goals.home,
        awayScore: fixtureData.goals.away
      };
      
      if (existingFixture) {
        // Update existing fixture
        await prisma.fixture.update({
          where: { apiId: fixtureData.fixture.id },
          data: fixtureData_obj
        });
        updatedCount++;
      } else {
        // Create new fixture
        await prisma.fixture.create({
          data: {
            apiId: fixtureData.fixture.id,
            ...fixtureData_obj
          }
        });
        newCount++;
      }
    }
    
    // Update API call count
    await prisma.apiSync.update({
      where: { type: 'fixtures' },
      data: {
        apiCalls: apiCallCount,
        lastSync: new Date()
      }
    });
    
    console.log(`✅ Fixtures sync completed: ${newCount} new, ${updatedCount} updated`);
    console.log(`📊 API calls used: ${apiCallCount}/100`);
    
    return NextResponse.json({
      success: true,
      message: 'Fixtures sync completed successfully',
      stats: {
        teamsFound: teamCount,
        fixturesNew: newCount,
        fixturesUpdated: updatedCount,
        totalFixtures: newCount + updatedCount
      },
      apiCalls: apiCallCount
    });
    
  } catch (error) {
    console.error('❌ Error syncing fixtures:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during fixtures sync',
        apiCalls: (await prisma.apiSync.findUnique({ where: { type: 'fixtures' } }))?.apiCalls || 0
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/admin/sync-fixtures - Check sync status
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking sync status...');
    
    const apiSync = await prisma.apiSync.findUnique({
      where: { type: 'fixtures' }
    });
    console.log('📊 ApiSync found:', apiSync);
    
    const fixtureCount = await prisma.fixture.count();
    const teamCount = await prisma.team.count();
    console.log('📈 Counts - Fixtures:', fixtureCount, 'Teams:', teamCount);
    
    return NextResponse.json({
      success: true,
      lastSync: apiSync?.lastSync || null,
      apiCallsToday: apiSync?.apiCalls || 0,
      fixtureCount,
      teamCount
    });
    
  } catch (error) {
    console.error('❌ Error checking sync status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check sync status',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}