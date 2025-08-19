const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixDemoUser() {
  try {
    // Delete existing demo user if exists
    await prisma.user.deleteMany({
      where: { email: 'demo@example.com' }
    });
    console.log('🗑️  Deleted existing demo user');

    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12);
    console.log('🔐 Password hashed');

    // Create the demo user with proper password
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        username: 'demo',
        displayName: 'Demo User',
        password: hashedPassword,
        favoriteTeam: 'Manchester United',
        totalPredictions: 0,
        correctPredictions: 0,
        totalPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        accuracyRate: 0.0,
      }
    });

    console.log('✅ Demo user created successfully:', {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      hasPassword: !!user.password
    });

    // Test password immediately
    const passwordMatch = await bcrypt.compare('demo123', user.password);
    console.log('🔐 Password verification test:', passwordMatch ? '✅ PASS' : '❌ FAIL');

  } catch (error) {
    console.error('❌ Error fixing demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoUser();