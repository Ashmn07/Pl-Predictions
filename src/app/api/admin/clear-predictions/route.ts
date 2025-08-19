import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// POST /api/admin/clear-predictions - Clear only prediction data
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Starting predictions cleanup...');
    
    // Delete all predictions
    console.log('Deleting all predictions...');
    const deletedPredictions = await prisma.prediction.deleteMany({});
    
    console.log('✅ Predictions cleanup completed');
    
    return NextResponse.json({
      success: true,
      message: 'All predictions cleared successfully',
      stats: {
        predictionsDeleted: deletedPredictions.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing predictions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during predictions cleanup'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}