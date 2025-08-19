import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { fixtureIds } = body;

    if (!Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      return NextResponse.json({ error: 'fixtureIds is required and must be a non-empty array' }, { status: 400 });
    }

    console.log(`📤 Submitting predictions for user ${user.email}, fixtures: ${fixtureIds.join(', ')}`);

    // Check that all predictions belong to the current user
    const userPredictions = await prisma.prediction.findMany({
      where: {
        userId: user.id,
        fixtureId: { in: fixtureIds }
      },
      include: {
        fixture: {
          select: {
            id: true,
            kickoffTime: true,
            status: true,
            gameweek: true,
            homeTeam: { select: { name: true } },
            awayTeam: { select: { name: true } }
          }
        }
      }
    });

    if (userPredictions.length !== fixtureIds.length) {
      return NextResponse.json(
        { error: 'Some predictions were not found or do not belong to you' }, 
        { status: 400 }
      );
    }

    // Check that fixtures haven't started yet
    const now = new Date();
    const startedFixtures = userPredictions.filter(p => 
      new Date(p.fixture.kickoffTime) <= now || p.fixture.status !== 'SCHEDULED'
    );

    if (startedFixtures.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot submit predictions for fixtures that have already started',
          startedFixtures: startedFixtures.map(p => ({
            fixture: `${p.fixture.homeTeam.name} vs ${p.fixture.awayTeam.name}`,
            kickoffTime: p.fixture.kickoffTime,
            status: p.fixture.status
          }))
        }, 
        { status: 400 }
      );
    }

    // Submit all predictions
    const result = await prisma.prediction.updateMany({
      where: {
        userId: user.id,
        fixtureId: { in: fixtureIds },
        isSubmitted: false // Only update draft predictions
      },
      data: {
        isSubmitted: true
      }
    });

    console.log(`✅ Successfully submitted ${result.count} predictions`);

    // Get updated predictions to return
    const updatedPredictions = await prisma.prediction.findMany({
      where: {
        userId: user.id,
        fixtureId: { in: fixtureIds }
      },
      include: {
        fixture: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully submitted ${result.count} predictions`,
      submittedCount: result.count,
      predictions: updatedPredictions.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        submittedAt: p.submittedAt?.toISOString() || null,
        fixture: {
          ...p.fixture,
          kickoffTime: p.fixture.kickoffTime.toISOString(),
          createdAt: p.fixture.createdAt.toISOString(),
          updatedAt: p.fixture.updatedAt.toISOString(),
        }
      }))
    });

  } catch (error) {
    console.error('❌ Error submitting predictions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to submit predictions'
      },
      { status: 500 }
    );
  }
}