import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/leagues - Get leagues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'public', 'private', or null for all
    const userId = searchParams.get('userId'); // Get leagues for specific user
    const search = searchParams.get('search'); // Search query
    const limit = parseInt(searchParams.get('limit') || '20');

    let whereClause: any = {
      isActive: true
    };

    if (type) {
      whereClause.type = type.toUpperCase();
    }

    if (userId) {
      // Get leagues where user is a member or owner
      whereClause = {
        ...whereClause,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      };
    }

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const leagues = await prisma.league.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                totalPoints: true,
                currentRank: true,
                accuracyRate: true
              }
            }
          },
          orderBy: [
            {
              user: {
                totalPoints: 'desc'
              }
            }
          ]
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Add member count to each league
    const leaguesWithCounts = leagues.map(league => ({
      ...league,
      memberCount: league._count.members
    }));

    return NextResponse.json(leaguesWithCounts);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leagues - Create new league
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, type, maxMembers, prize, rules } = body;

    if (!name || !description || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate join code for private leagues
    const joinCode = type === 'PRIVATE' ? generateJoinCode() : null;

    // Create league
    const league = await prisma.league.create({
      data: {
        name,
        description,
        type: type.toUpperCase(),
        ownerId: user.id,
        maxMembers: maxMembers ? parseInt(maxMembers) : null,
        prize,
        rules: rules ? JSON.stringify(rules) : null,
        joinCode
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    // Add creator as league member with owner role
    await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId: user.id,
        role: 'OWNER'
      }
    });

    // Create social activity
    await prisma.socialActivity.create({
      data: {
        userId: user.id,
        type: 'LEAGUE_JOINED',
        description: `created league "${name}"`,
        details: {
          leagueId: league.id,
          leagueName: name,
          action: 'created'
        }
      }
    });

    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}