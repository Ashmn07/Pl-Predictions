import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Skip teams and fixtures creation - will be created via admin sync
  console.log('⏭️ Skipping teams and fixtures - use admin sync to populate from API');
  const createdTeams: any[] = [];
  const createdFixtures: any[] = [];

  // Create achievements
  console.log('Creating achievements...');
  const achievements = [
    {
      name: 'First Prediction',
      description: 'Make your first prediction',
      icon: '🎯',
      rarity: 'COMMON' as const,
      points: 10,
      category: 'Milestone',
      conditions: { type: 'prediction_count', value: 1 }
    },
    {
      name: 'Perfect Week',
      description: 'Get all predictions correct in a gameweek',
      icon: '💯',
      rarity: 'RARE' as const,
      points: 50,
      category: 'Accuracy',
      conditions: { type: 'perfect_gameweek', value: 1 }
    },
    {
      name: 'Hot Streak',
      description: 'Get 5 predictions correct in a row',
      icon: '🔥',
      rarity: 'RARE' as const,
      points: 30,
      category: 'Streak',
      conditions: { type: 'streak', value: 5 }
    },
    {
      name: 'Century Club',
      description: 'Reach 100 total points',
      icon: '💯',
      rarity: 'EPIC' as const,
      points: 25,
      category: 'Points',
      conditions: { type: 'total_points', value: 100 }
    },
    {
      name: 'Social Butterfly',
      description: 'Add 5 friends',
      icon: '🦋',
      rarity: 'COMMON' as const,
      points: 15,
      category: 'Social',
      conditions: { type: 'friend_count', value: 5 }
    },
    {
      name: 'League Legend',
      description: 'Win a private league',
      icon: '👑',
      rarity: 'LEGENDARY' as const,
      points: 100,
      category: 'Competition',
      conditions: { type: 'league_winner', value: 1 }
    }
  ];

  const createdAchievements = [];
  for (const achievement of achievements) {
    const createdAchievement = await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    });
    createdAchievements.push(createdAchievement);
  }
  console.log(`✅ Created ${createdAchievements.length} achievements`);

  // Create admin user
  console.log('Creating admin user...');
  const bcrypt = require('bcrypt');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@plpredictions.com' },
    update: {},
    create: {
      email: 'admin@plpredictions.com',
      username: 'admin',
      displayName: 'System Admin',
      avatar: '⚙️',
      favoriteTeam: 'Arsenal',
      password: adminPassword,
      totalPoints: 0,
      currentRank: null,
      accuracyRate: 0.0,
      totalPredictions: 0,
      correctPredictions: 0,
      currentStreak: 0,
      bestStreak: 0
    }
  });

  // Create a demo user
  console.log('Creating demo user...');
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'demo_user',
      displayName: 'Demo User',
      avatar: '👤',
      favoriteTeam: 'Arsenal',
      password: demoPassword,
      totalPoints: 85,
      currentRank: 1,
      accuracyRate: 72.5,
      totalPredictions: 12,
      correctPredictions: 8,
      currentStreak: 3,
      bestStreak: 5
    }
  });


  // Give demo user some achievements
  const firstPredictionAchievement = createdAchievements.find(a => a.name === 'First Prediction');
  if (firstPredictionAchievement) {
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: demoUser.id,
          achievementId: firstPredictionAchievement.id
        }
      },
      update: {},
      create: {
        userId: demoUser.id,
        achievementId: firstPredictionAchievement.id
      }
    });
  }

  console.log(`✅ Created admin user: ${adminUser.email} (password: admin123)`);
  console.log(`✅ Created demo user: ${demoUser.email} (password: demo123)`);

  // Skip sample predictions - no fixtures created yet
  console.log('⏭️ Skipping sample predictions - no fixtures available yet');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`- ${createdAchievements.length} achievements`);
  console.log(`- 1 admin user + 1 demo user`);
  console.log('\n🚀 You can now start the application and test with:');
  console.log('👥 Demo User - Email: demo@example.com, Password: demo123');
  console.log('⚙️ Admin User - Email: admin@plpredictions.com, Password: admin123');
  console.log('\n⚠️ Use Admin Panel to sync teams and fixtures from API!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });