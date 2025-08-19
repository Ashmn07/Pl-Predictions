const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (existingUser) {
      console.log('✅ Demo user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Create the demo user
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
      }
    });

    console.log('✅ Demo user created:', {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName
    });
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();