import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const gameweek = searchParams.get('gameweek');
    const leagueId = searchParams.get('leagueId');

    let users;

    if (leagueId) {
      // Get league-specific leaderboard
      users = await prisma.user.findMany({
        where: {
          leagueMembers: {
            some: {
              leagueId: leagueId
            }
          }
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          totalPoints: true,
          currentRank: true,
          previousRank: true,
          accuracyRate: true,
          totalPredictions: true,
          correctPredictions: true,
          currentStreak: true,
          bestStreak: true,
          favoriteTeam: true,
          achievements: {
            include: {
              achievement: true
            },
            orderBy: {
              unlockedAt: 'desc'
            },
            take: 5
          }
        },
        orderBy: [
          { totalPoints: 'desc' },
          { accuracyRate: 'desc' },
          { totalPredictions: 'desc' }
        ],
        take: limit
      });
    } else if (gameweek) {
      // Get gameweek-specific leaderboard
      const gameweekNumber = parseInt(gameweek);
      
      users = await prisma.user.findMany({
        where: {
          predictions: {
            some: {
              fixture: {
                gameweek: gameweekNumber
              },
              points: {
                not: null
              }
            }
          }
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          totalPoints: true,
          currentRank: true,
          previousRank: true,
          accuracyRate: true,
          totalPredictions: true,
          correctPredictions: true,
          currentStreak: true,
          bestStreak: true,
          favoriteTeam: true,
          achievements: {
            include: {
              achievement: true
            },
            orderBy: {
              unlockedAt: 'desc'
            },
            take: 5
          },
          predictions: {
            where: {
              fixture: {
                gameweek: gameweekNumber
              },
              points: {
                not: null
              }
            },
            select: {
              points: true
            }
          }
        },
        orderBy: [
          { totalPoints: 'desc' },
          { accuracyRate: 'desc' }
        ],
        take: limit
      });

      // Add gameweek points to each user
      users = users.map(user => ({
        ...user,
        gameweekPoints: user.predictions.reduce((sum, p) => sum + (p.points || 0), 0)
      }));

      // Sort by gameweek points for gameweek leaderboard
      users.sort((a, b) => (b.gameweekPoints || 0) - (a.gameweekPoints || 0));
    } else {
      // Get global leaderboard
      users = await prisma.user.findMany({
        where: {
          totalPredictions: {
            gt: 0 // Only users who have made predictions
          }
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          totalPoints: true,
          currentRank: true,
          previousRank: true,
          accuracyRate: true,
          totalPredictions: true,
          correctPredictions: true,
          currentStreak: true,
          bestStreak: true,
          favoriteTeam: true,
          achievements: {
            include: {
              achievement: true
            },
            orderBy: {
              unlockedAt: 'desc'
            },
            take: 5
          }
        },
        orderBy: [
          { totalPoints: 'desc' },
          { accuracyRate: 'desc' },
          { totalPredictions: 'desc' }
        ],
        take: limit
      });
    }

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      rankChange: user.previousRank ? user.previousRank - (index + 1) : 0
    }));

    // Update current ranks in database (for global leaderboard only)
    if (!gameweek && !leagueId) {
      for (let i = 0; i < rankedUsers.length; i++) {
        await prisma.user.update({
          where: { id: rankedUsers[i].id },
          data: {
            previousRank: rankedUsers[i].currentRank,
            currentRank: i + 1
          }
        });
      }
    }

    return NextResponse.json(rankedUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leaderboard/recalculate - Recalculate all rankings (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    // Recalculate accuracy rates
    const users = await prisma.user.findMany({
      where: {
        totalPredictions: {
          gt: 0
        }
      },
      select: {
        id: true,
        totalPredictions: true,
        correctPredictions: true
      }
    });

    for (const user of users) {
      const accuracyRate = user.totalPredictions > 0 
        ? (user.correctPredictions / user.totalPredictions) * 100 
        : 0;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          accuracyRate: Math.round(accuracyRate * 100) / 100
        }
      });
    }

    // Get updated leaderboard
    const updatedUsers = await prisma.user.findMany({
      where: {
        totalPredictions: {
          gt: 0
        }
      },
      select: {
        id: true,
        currentRank: true
      },
      orderBy: [
        { totalPoints: 'desc' },
        { accuracyRate: 'desc' },
        { totalPredictions: 'desc' }
      ]
    });

    // Update ranks
    for (let i = 0; i < updatedUsers.length; i++) {
      await prisma.user.update({
        where: { id: updatedUsers[i].id },
        data: {
          previousRank: updatedUsers[i].currentRank,
          currentRank: i + 1
        }
      });
    }

    return NextResponse.json({ 
      message: 'Leaderboard recalculated successfully',
      updatedUsers: updatedUsers.length
    });
  } catch (error) {
    console.error('Error recalculating leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}