const { databaseSeeder } = require('../lib/database-seeder');

async function runSeeding() {
  console.log('🌱 Starting database seeding process...\n');
  
  try {
    const startTime = Date.now();
    
    // Run the seeding
    await databaseSeeder.seedAll();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n⏱️  Seeding completed in ${duration.toFixed(2)} seconds`);
    console.log('🎉 Database is now ready with real Premier League data!');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    process.exit(1);
  }
}

// Allow running as CLI script
if (require.main === module) {
  runSeeding();
}

module.exports = { runSeeding };