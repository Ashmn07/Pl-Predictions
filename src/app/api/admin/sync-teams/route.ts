import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiFootball, CURRENT_SEASON } from '@/lib/football-api';

// POST /api/admin/sync-teams - One-time sync of teams from fixtures
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('👥 Starting one-time teams sync...');
    
    // Check if teams already exist
    const existingTeamCount = await prisma.team.count();
    if (existingTeamCount > 0) {
      console.log(`⚠️ ${existingTeamCount} teams already exist. Skipping team creation.`);
      return NextResponse.json({
        success: false,
        message: `Teams already exist (${existingTeamCount} teams). Use this only for first-time setup.`,
        existingTeams: existingTeamCount
      }, { status: 400 });
    }

    // Get fixtures to extract teams
    console.log('⚽ Fetching fixtures to extract teams...');
    const fixturesResponse = await apiFootball.getPremierLeagueFixtures();
    
    // Extract unique teams from fixtures
    console.log('👥 Extracting teams from fixtures...');
    const uniqueTeams = new Map();
    
    for (const fixtureData of fixturesResponse.response) {
      // Add home team
      uniqueTeams.set(fixtureData.teams.home.id, {
        apiId: fixtureData.teams.home.id,
        name: fixtureData.teams.home.name,
        shortName: fixtureData.teams.home.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() + fixtureData.teams.home.id.toString().slice(-1),
        logoUrl: fixtureData.teams.home.logo
      });
      
      // Add away team  
      uniqueTeams.set(fixtureData.teams.away.id, {
        apiId: fixtureData.teams.away.id,
        name: fixtureData.teams.away.name,
        shortName: fixtureData.teams.away.name.replace(/\s+/g, '').substring(0, 3).toUpperCase() + fixtureData.teams.away.id.toString().slice(-1),
        logoUrl: fixtureData.teams.away.logo
      });
    }
    
    // Create teams in database
    console.log(`📝 Creating ${uniqueTeams.size} teams...`);
    const createdTeams = [];
    
    for (const [apiId, teamData] of uniqueTeams) {
      const team = await prisma.team.create({
        data: {
          apiId: teamData.apiId,
          name: teamData.name,
          shortName: teamData.shortName,
          logoUrl: teamData.logoUrl
        }
      });
      
      createdTeams.push(team);
    }
    
    console.log(`✅ Created ${createdTeams.length} teams successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Teams sync completed successfully',
      stats: {
        teamsCreated: createdTeams.length,
        teamNames: createdTeams.map(t => t.name)
      },
      apiCalls: 1
    });
    
  } catch (error) {
    console.error('❌ Error syncing teams:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during teams sync'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/admin/sync-teams - Check teams status
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const teamCount = await prisma.team.count();
    const teams = await prisma.team.findMany({
      select: { name: true, shortName: true, logoUrl: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      teamCount,
      teams: teams.slice(0, 10), // Show first 10 teams
      hasMoreTeams: teams.length > 10
    });
    
  } catch (error) {
    console.error('❌ Error checking teams status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check teams status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}