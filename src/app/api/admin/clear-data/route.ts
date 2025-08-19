import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// POST /api/admin/clear-data - Clear all teams and fixtures data
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Starting database cleanup...');
    
    // Delete in order to avoid foreign key constraints
    console.log('Deleting predictions...');
    const deletedPredictions = await prisma.prediction.deleteMany({});
    
    console.log('Deleting fixtures...');
    const deletedFixtures = await prisma.fixture.deleteMany({});
    
    console.log('Deleting teams...');
    const deletedTeams = await prisma.team.deleteMany({});
    
    console.log('Resetting API sync counters...');
    await prisma.apiSync.deleteMany({
      where: { type: { in: ['fixtures', 'teams'] } }
    });
    
    console.log('✅ Database cleanup completed');
    
    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      stats: {
        predictionsDeleted: deletedPredictions.count,
        fixturesDeleted: deletedFixtures.count,
        teamsDeleted: deletedTeams.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during database cleanup'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}