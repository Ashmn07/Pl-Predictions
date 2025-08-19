import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/fixtures - Return fixtures from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameweek = searchParams.get('gameweek');
    const season = searchParams.get('season') || '2025-26';
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    console.log(`⚽ GET /api/fixtures called - gameweek: ${gameweek}, season: ${season}, status: ${status}, limit: ${limit}`);
    
    // Build where conditions
    const whereConditions: any = {
      season: season
    };
    
    if (gameweek) {
      whereConditions.gameweek = parseInt(gameweek);
    }
    
    if (status) {
      whereConditions.status = status.toUpperCase();
    }
    
    // Get fixtures from database
    const fixtures = await prisma.fixture.findMany({
      where: whereConditions,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            color: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            color: true
          }
        }
      },
      orderBy: [
        { gameweek: 'asc' },
        { kickoffTime: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });
    
    // Transform to match our frontend interface
    const transformedFixtures = fixtures.map(fixture => ({
      id: fixture.id,
      apiId: fixture.apiId,
      gameweek: fixture.gameweek,
      season: fixture.season,
      homeTeam: {
        id: fixture.homeTeam.id,
        name: fixture.homeTeam.name,
        shortName: fixture.homeTeam.shortName,
        logo: fixture.homeTeam.logoUrl,
        color: fixture.homeTeam.color
      },
      awayTeam: {
        id: fixture.awayTeam.id,
        name: fixture.awayTeam.name,
        shortName: fixture.awayTeam.shortName,
        logo: fixture.awayTeam.logoUrl,
        color: fixture.awayTeam.color
      },
      kickoff: fixture.kickoffTime.toISOString(),
      status: fixture.status,
      venue: fixture.venue,
      referee: fixture.referee,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      isFinished: fixture.status === 'FINISHED',
      isLive: fixture.status === 'LIVE'
    }));
    
    console.log(`✅ Returning ${transformedFixtures.length} fixtures from database`);
    
    return NextResponse.json({
      success: true,
      count: transformedFixtures.length,
      fixtures: transformedFixtures,
      filters: {
        gameweek: gameweek ? parseInt(gameweek) : null,
        season,
        status: status?.toUpperCase() || null
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting fixtures:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fixtures' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

