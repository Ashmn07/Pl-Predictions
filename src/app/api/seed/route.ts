import { NextRequest, NextResponse } from 'next/server';
import { databaseSeeder } from '@/lib/database-seeder';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    const force = searchParams.get('force') === 'true';
    
    console.log(`🌱 Starting seeding action: ${action}`);
    
    let result: any = {};
    const startTime = Date.now();
    
    switch (action) {
      case 'teams':
        await databaseSeeder.seedTeams();
        result.message = 'Teams seeded successfully';
        break;
        
      case 'fixtures':
        await databaseSeeder.seedFixtures();
        result.message = 'Fixtures seeded successfully';
        break;
        
      case 'achievements':
        await databaseSeeder.seedAchievements();
        result.message = 'Achievements seeded successfully';
        break;
        
      case 'demo-user':
        await databaseSeeder.seedDemoUser();
        result.message = 'Demo user created successfully';
        break;
        
      case 'clear':
        if (!force) {
          return NextResponse.json(
            { error: 'Clear action requires force=true parameter' },
            { status: 400 }
          );
        }
        await databaseSeeder.clearData();
        result.message = 'Data cleared successfully';
        break;
        
      case 'all':
      default:
        await databaseSeeder.seedAll();
        result.message = 'Full database seeding completed successfully';
        break;
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    return NextResponse.json({
      success: true,
      action,
      ...result,
      duration: `${duration.toFixed(2)} seconds`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database seeding failed'
      },
      { status: 500 }
    );
  }
}