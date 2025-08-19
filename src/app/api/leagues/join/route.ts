import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/leagues/join - Join league by ID or join code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true, displayName: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { leagueId, joinCode } = body;

    if (!leagueId && !joinCode) {
      return NextResponse.json({ error: 'Either leagueId or joinCode is required' }, { status: 400 });
    }

    // Find league by ID or join code
    let league;
    if (leagueId) {
      league = await prisma.league.findUnique({
        where: { id: leagueId }
      });
    } else if (joinCode) {
      league = await prisma.league.findUnique({
        where: { joinCode: joinCode.toUpperCase() }
      });
    }

    if (!league) {
      return NextResponse.json({ error: 'League not found or invalid join code' }, { status: 404 });
    }

    if (!league.isActive) {
      return NextResponse.json({ error: 'League is no longer active' }, { status: 400 });
    }

    // Check if league is private and join code is provided for private leagues
    if (league.type === 'PRIVATE' && !joinCode) {
      return NextResponse.json({ error: 'Join code required for private leagues' }, { status: 400 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId: league.id,
          userId: user.id
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'You are already a member of this league' }, { status: 400 });
    }

    // Check if league is full
    if (league.maxMembers) {
      const memberCount = await prisma.leagueMember.count({
        where: { leagueId: league.id }
      });

      if (memberCount >= league.maxMembers) {
        return NextResponse.json({ error: 'League is full' }, { status: 400 });
      }
    }

    // Add user to league
    const membership = await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId: user.id,
        role: 'MEMBER'
      }
    });

    // Create social activity
    await prisma.socialActivity.create({
      data: {
        userId: user.id,
        type: 'LEAGUE_JOINED',
        description: `joined league "${league.name}"`,
        details: {
          leagueId: league.id,
          leagueName: league.name,
          action: 'joined'
        }
      }
    });

    return NextResponse.json({ 
      message: 'Successfully joined league',
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        type: league.type
      },
      membership
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}