import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/reset-user-stats
 * Reset all user statistics to 0 (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'admin@plpredictions.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Resetting all user statistics...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        totalPoints: true,
        totalPredictions: true
      }
    });

    console.log(`Found ${users.length} users to reset`);

    // Reset all user statistics
    const resetResult = await prisma.user.updateMany({
      data: {
        totalPoints: 0,
        currentRank: null,
        previousRank: null,
        accuracyRate: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        currentStreak: 0,
        bestStreak: 0
      }
    });

    console.log(`✅ Reset statistics for ${resetResult.count} users`);

    // Also reset points on all predictions
    const predictionResetResult = await prisma.prediction.updateMany({
      data: {
        points: null,
        isCorrect: null
      }
    });

    console.log(`✅ Reset points for ${predictionResetResult.count} predictions`);

    // Get updated user list
    const updatedUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        totalPoints: true,
        totalPredictions: true,
        accuracyRate: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All user statistics reset successfully',
      stats: {
        usersReset: resetResult.count,
        predictionsReset: predictionResetResult.count
      },
      users: updatedUsers.map(user => ({
        email: user.email,
        displayName: user.displayName,
        totalPoints: user.totalPoints,
        totalPredictions: user.totalPredictions,
        accuracyRate: user.accuracyRate
      }))
    });

  } catch (error) {
    console.error('❌ Error resetting user statistics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset user statistics',
        message: 'Failed to reset user statistics'
      }, 
      { status: 500 }
    );
  }
}