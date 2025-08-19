import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 GET /api/users/stats called');
    const session = await getServerSession(authOptions);
    console.log('🔐 Server session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with all stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        totalPoints: true,
        currentRank: true,
        previousRank: true,
        accuracyRate: true,
        totalPredictions: true,
        correctPredictions: true,
        currentStreak: true,
        bestStreak: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate accuracy rate
    const accuracyRate = user.totalPredictions > 0 
      ? (user.correctPredictions / user.totalPredictions) * 100 
      : 0;

    // Get total prediction count (including unsubmitted)
    const totalPredictionsMade = await prisma.prediction.count({
      where: { userId: session.user.id }
    });

    // Get submitted predictions count
    const submittedPredictions = await prisma.prediction.count({
      where: { 
        userId: session.user.id,
        isSubmitted: true 
      }
    });

    // Get current rank from leaderboard
    const usersAbove = await prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints
        }
      }
    });
    const currentRank = usersAbove + 1;

    const stats = {
      totalPoints: user.totalPoints,
      currentRank: currentRank,
      previousRank: user.previousRank,
      predictionsMade: totalPredictionsMade,
      submittedPredictions: submittedPredictions,
      accuracyRate: parseFloat(accuracyRate.toFixed(1)),
      totalPredictions: user.totalPredictions,
      correctPredictions: user.correctPredictions,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      lastUpdated: user.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch user stats'
      },
      { status: 500 }
    );
  }
}

// Update user stats (called internally after predictions are scored)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { totalPoints, correctPredictions, totalPredictions, currentStreak, bestStreak } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(totalPoints !== undefined && { totalPoints }),
        ...(correctPredictions !== undefined && { correctPredictions }),
        ...(totalPredictions !== undefined && { totalPredictions }),
        ...(currentStreak !== undefined && { currentStreak }),
        ...(bestStreak !== undefined && { bestStreak }),
        accuracyRate: totalPredictions > 0 
          ? (correctPredictions / totalPredictions) * 100 
          : 0,
      },
      select: {
        totalPoints: true,
        correctPredictions: true,
        totalPredictions: true,
        accuracyRate: true,
        currentStreak: true,
        bestStreak: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        ...updatedUser,
        lastUpdated: updatedUser.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update user stats'
      },
      { status: 500 }
    );
  }
}