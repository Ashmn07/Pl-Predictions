# Database & Backend Setup Guide

## 🏗️ Phase 7: Database & Backend Infrastructure

This guide covers setting up the complete database and backend infrastructure for the Premier League Predictions app.

## ✅ What's Already Completed

### 1. Database Schema (Prisma)
- **Complete database schema** with all necessary models
- **NextAuth.js integration** with Prisma adapter
- **Relationships** between users, predictions, leagues, friends, etc.
- **Type-safe database operations** with Prisma Client

### 2. Authentication System
- **Database-backed authentication** with NextAuth.js
- **OAuth providers** (Google, GitHub) ready for credentials
- **Credentials provider** with bcrypt password hashing
- **Session management** using database sessions

### 3. API Routes Created
- **`/api/users`** - User management (GET, PUT, POST)
- **`/api/predictions`** - Prediction system (GET, POST)
- **`/api/fixtures`** - Fixture management (GET, POST, PUT)
- **`/api/leaderboard`** - Rankings and leaderboard (GET, POST)
- **`/api/leagues`** - League management (GET, POST)
- **`/api/leagues/join`** - Join leagues functionality (POST)

### 4. Database Seeding
- **Premier League teams** (20 teams with logos)
- **Sample fixtures** for Gameweek 1
- **Achievement system** (6 achievements with different rarities)
- **Demo user** with sample data for testing

## 🚀 Setup Instructions

### Step 1: Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your values:

```env
# Database - You need a PostgreSQL database
DATABASE_URL="postgresql://username:password@localhost:5432/prediction_db?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: OAuth Providers (leave empty to use demo only)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Step 2: Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb prediction_db`
3. Update `DATABASE_URL` in `.env.local`

#### Option B: Cloud Database (Recommended)
Use a managed PostgreSQL service:

**Vercel Postgres:**
```bash
# Install Vercel CLI and create postgres database
npm i -g vercel
vercel postgres create prediction-db
```

**Supabase:**
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings > Database
3. Update `DATABASE_URL`

**Railway/PlanetScale/Neon.tech:**
Similar process - create database and get connection string.

### Step 3: Run Database Migrations & Seed

```bash
# Generate Prisma client (creates TypeScript types)
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data
npm run db:seed

# Optional: View database in Prisma Studio
npm run db:studio
```

**Note:** The seeding uses proper TypeScript enum types for predictions (PredictionType.HOME_WIN, etc.)

### Step 4: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000`

3. Test authentication with demo user:
   - Email: `demo@example.com`
   - Password: Any password (demo mode)

4. Or register a new account via `/auth/signup`

## 📋 Database Models Overview

### Core Models
- **User** - User profiles, stats, authentication
- **Team** - Premier League teams (20 teams)
- **Fixture** - Matches with gameweeks, status, results
- **Prediction** - User predictions with confidence levels

### Social Features
- **Friend** / **FriendRequest** - Friends system
- **League** / **LeagueMember** / **LeagueInvitation** - Private leagues
- **SocialActivity** - Activity feed for friends

### Gamification
- **Achievement** / **UserAchievement** - Achievement system

### Authentication (NextAuth.js)
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

## 🔧 Available API Endpoints

### Authentication
- **NextAuth.js** handles all auth at `/api/auth/*`

### Users
- `GET /api/users` - Get current user profile
- `PUT /api/users` - Update user profile
- `POST /api/users` - Create new user (registration)

### Predictions
- `GET /api/predictions` - Get user predictions
- `POST /api/predictions` - Create/update prediction

### Fixtures
- `GET /api/fixtures` - Get fixtures (with filters)
- `POST /api/fixtures` - Create fixture (admin)
- `PUT /api/fixtures` - Update fixture result (admin)

### Leaderboard
- `GET /api/leaderboard` - Get rankings
- `POST /api/leaderboard/recalculate` - Recalculate rankings

### Leagues
- `GET /api/leagues` - Get leagues
- `POST /api/leagues` - Create league
- `POST /api/leagues/join` - Join league

## 🧪 Testing the Database

Once set up, you can test various features:

1. **Authentication:**
   - Sign up new users
   - Login with OAuth (if configured)
   - Login with credentials

2. **Predictions:**
   - Make predictions on fixtures
   - View prediction history

3. **Social Features:**
   - Create private leagues
   - Join leagues with codes
   - View leaderboards

4. **Database Admin:**
   - Use Prisma Studio: `npm run db:studio`
   - Direct database queries with Prisma Client

## 🔍 Troubleshooting

**Database Connection Issues:**
- Verify `DATABASE_URL` format
- Ensure database exists and is accessible
- Check firewall settings for cloud databases

**Prisma Issues:**
- Regenerate client: `npm run db:generate`
- Reset database: `npx prisma db push --force-reset`

**NextAuth Issues:**
- Verify `NEXTAUTH_SECRET` is set
- Check OAuth provider configurations
- Ensure `NEXTAUTH_URL` matches your domain

## 🚧 Next Steps

With the database and backend set up, you can now:

1. **Integrate Real Premier League API** (Phase 7.4)
2. **Migrate Frontend from Mock Data** (Phase 7.5)
3. **Add Real-time Features** (Phase 7.6)
4. **Deploy to Production** with Vercel + Database

The foundation is now solid and ready for real users! 🎉