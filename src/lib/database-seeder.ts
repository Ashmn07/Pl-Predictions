// Database seeding service for Premier League data
import { PrismaClient, PredictionType } from '@prisma/client';
import { apiFootball, APIFootballTeam, APIFootballFixture, CURRENT_SEASON } from './football-api';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class DatabaseSeeder {
  async seedTeams(): Promise<void> {
    console.log('🏈 Starting teams seeding...');
    
    try {
      // Get teams from API
      const response = await apiFootball.getPremierLeagueTeams();
      const apiTeams = response.response;
      
      console.log(`📥 Fetched ${apiTeams.length} teams from API`);
      console.log('Sample team data:', apiTeams[0]);
      
      // Transform and insert teams
      const teams = apiTeams.map((apiTeam: APIFootballTeam) => ({
        apiId: apiTeam.team.id,
        name: apiTeam.team.name,
        shortName: apiTeam.team.code || (apiTeam.team.name ? apiTeam.team.name.substring(0, 3).toUpperCase() : 'TBD'),
        logoUrl: apiTeam.team.logo || '',
        founded: apiTeam.team.founded || null,
        venue: apiTeam.venue?.name || null,
        city: apiTeam.venue?.city || null,
        capacity: apiTeam.venue?.capacity || null,
      }));
      
      // Use upsert to avoid duplicates
      for (const team of teams) {
        await prisma.team.upsert({
          where: { apiId: team.apiId },
          update: team,
          create: team,
        });
      }
      
      console.log(`✅ Successfully seeded ${teams.length} teams`);
    } catch (error) {
      console.error('❌ Error seeding teams:', error);
      throw error;
    }
  }

  async seedFixtures(): Promise<void> {
    console.log('⚽ Starting fixtures seeding...');
    
    try {
      // Get all fixtures for current season
      const response = await apiFootball.getPremierLeagueFixtures();
      const apiFixtures = response.response;
      
      console.log(`📥 Fetched ${apiFixtures.length} fixtures from API`);
      
      // Transform and insert fixtures
      let processedCount = 0;
      
      for (const apiFixture of apiFixtures) {
        try {
          // Get teams from database by API ID
          const homeTeam = await prisma.team.findUnique({
            where: { apiId: apiFixture.teams.home.id }
          });
          
          const awayTeam = await prisma.team.findUnique({
            where: { apiId: apiFixture.teams.away.id }
          });
          
          if (!homeTeam || !awayTeam) {
            console.warn(`⚠️ Skipping fixture ${apiFixture.fixture.id}: Team not found (home: ${apiFixture.teams.home.name}, away: ${apiFixture.teams.away.name})`);
            continue;
          }
          
          // Extract round number from string like "Regular Season - 21"
          const roundMatch = apiFixture.league.round.match(/Regular Season - (\d+)/);
          const gameweek = roundMatch ? parseInt(roundMatch[1]) : 1;
          
          // Determine fixture status
          let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
          switch (apiFixture.fixture.status.short) {
            case 'NS': status = 'SCHEDULED'; break;
            case '1H': case '2H': case 'HT': status = 'LIVE'; break;
            case 'FT': case 'AET': case 'PEN': status = 'FINISHED'; break;
            default: status = 'SCHEDULED';
          }
          
          const fixture = {
            apiId: apiFixture.fixture.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            kickoffTime: new Date(apiFixture.fixture.date),
            gameweek: gameweek,
            season: `${CURRENT_SEASON}-${CURRENT_SEASON + 1}`,
            status: status,
            homeScore: apiFixture.goals.home,
            awayScore: apiFixture.goals.away,
            venue: apiFixture.fixture.venue.name,
            referee: apiFixture.fixture.referee,
          };
          
          await prisma.fixture.upsert({
            where: { apiId: fixture.apiId },
            update: fixture,
            create: fixture,
          });
          
          processedCount++;
        } catch (fixtureError) {
          console.error(`❌ Error processing fixture ${apiFixture.fixture.id}:`, fixtureError);
        }
      }
      
      console.log(`✅ Successfully seeded ${processedCount} fixtures`);
    } catch (error) {
      console.error('❌ Error seeding fixtures:', error);
      throw error;
    }
  }

  async seedAchievements(): Promise<void> {
    console.log('🏆 Starting achievements seeding...');
    
    try {
      const achievements = [
        {
          name: "First Blood",
          description: "Make your first prediction",
          icon: "🎯",
          rarity: "COMMON",
          points: 10,
          category: "Predictions",
          conditions: { type: "PREDICTION", requirement: 1 }
        },
        {
          name: "Perfect Week",
          description: "Get all predictions correct in a gameweek",
          icon: "⭐",
          rarity: "RARE",
          points: 50,
          category: "Accuracy",
          conditions: { type: "ACCURACY", requirement: 100 }
        },
        {
          name: "Hot Streak",
          description: "Get 5 predictions correct in a row",
          icon: "🔥",
          rarity: "COMMON",
          points: 25,
          category: "Streaks",
          conditions: { type: "STREAK", requirement: 5 }
        },
        {
          name: "Century Club",
          description: "Make 100 predictions",
          icon: "💯",
          rarity: "RARE",
          points: 100,
          category: "Predictions",
          conditions: { type: "PREDICTION", requirement: 100 }
        },
        {
          name: "Golden Touch",
          description: "Maintain 80% accuracy over 20 predictions",
          icon: "👑",
          rarity: "EPIC",
          points: 75,
          category: "Accuracy",
          conditions: { type: "ACCURACY", requirement: 80, minPredictions: 20 }
        },
        {
          name: "Marathon Runner",
          description: "Get 10 predictions correct in a row",
          icon: "🏃‍♂️",
          rarity: "LEGENDARY",
          points: 100,
          category: "Streaks",
          conditions: { type: "STREAK", requirement: 10 }
        }
      ];
      
      for (const achievement of achievements) {
        await prisma.achievement.upsert({
          where: { name: achievement.name },
          update: achievement,
          create: achievement,
        });
      }
      
      console.log(`✅ Successfully seeded ${achievements.length} achievements`);
    } catch (error) {
      console.error('❌ Error seeding achievements:', error);
      throw error;
    }
  }

  async seedAll(): Promise<void> {
    console.log('🌱 Starting full database seeding...');
    
    try {
      await this.seedTeams();
      await this.seedFixtures();
      await this.seedAchievements();
      await this.seedDemoUser();
      
      console.log('🎉 Database seeding completed successfully!');
      
      // Show summary
      const teamCount = await prisma.team.count();
      const fixtureCount = await prisma.fixture.count();
      const achievementCount = await prisma.achievement.count();
      const userCount = await prisma.user.count();
      
      console.log('\n📊 Database Summary:');
      console.log(`   Teams: ${teamCount}`);
      console.log(`   Fixtures: ${fixtureCount}`);
      console.log(`   Achievements: ${achievementCount}`);
      console.log(`   Users: ${userCount}`);
      
    } catch (error) {
      console.error('❌ Error in database seeding:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async seedDemoUser(): Promise<void> {
    console.log('👤 Creating demo user...');
    
    try {
      const demoEmail = 'demo@example.com';
      const demoPassword = 'demo123';
      
      // Check if demo user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: demoEmail }
      });
      
      if (existingUser) {
        console.log('✅ Demo user already exists');
        return;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(demoPassword, 12);
      
      // Create demo user
      const demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          password: hashedPassword,
          username: 'demo_user',
          displayName: 'Demo User',
          avatar: '🎯',
          favoriteTeam: 'Arsenal',
          totalPoints: 150,
          currentRank: 5,
          previousRank: 8,
          accuracyRate: 75.5,
          totalPredictions: 12,
          correctPredictions: 9,
          currentStreak: 3,
          bestStreak: 5,
        }
      });
      
      console.log(`✅ Demo user created: ${demoUser.email}`);
    } catch (error) {
      console.error('❌ Error creating demo user:', error);
      throw error;
    }
  }

  async clearData(): Promise<void> {
    console.log('🗑️ Clearing existing data...');
    
    try {
      // Clear in correct order due to foreign key constraints
      await prisma.userAchievement.deleteMany({});
      await prisma.prediction.deleteMany({});
      await prisma.fixture.deleteMany({});
      await prisma.team.deleteMany({});
      await prisma.achievement.deleteMany({});
      await prisma.user.deleteMany({});
      
      console.log('✅ Data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

export const databaseSeeder = new DatabaseSeeder();