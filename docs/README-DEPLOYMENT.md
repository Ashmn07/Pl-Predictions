# Premier League Predictions - Free Deployment Guide

## 🆓 Free Hosting Setup (Vercel + PlanetScale)

This guide shows you how to deploy your Premier League predictions app **completely free** using Vercel and PlanetScale.

### Prerequisites
- GitHub account
- Vercel account (free)
- PlanetScale account (free)
- RapidAPI account for API-Football (free tier)

## 🚀 Step 1: Database Setup (PlanetScale)

### 1.1 Create PlanetScale Database
1. Go to [PlanetScale](https://planetscale.com) and sign up (free)
2. Create a new database called `premier-league-predictions`
3. Select the free "Hobby" plan (5GB storage)
4. Choose region closest to your users

### 1.2 Get Database Connection
1. Go to "Connect" tab in your PlanetScale dashboard
2. Select "Prisma" framework
3. Copy the `DATABASE_URL` - it looks like:
   ```
   mysql://username:password@host/database?sslaccept=strict
   ```

### 1.3 Initialize Database Schema
1. Update your `.env` file with the PlanetScale DATABASE_URL
2. Run database migrations:
   ```bash
   npx prisma db push
   ```

## 🌐 Step 2: Vercel Deployment

### 2.1 Prepare Repository
1. Push your code to GitHub
2. Make sure you have these files:
   - `vercel.json` (for cron configuration)
   - `.env.example` (for environment variables guide)

### 2.2 Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your Premier League predictions repository
4. Vercel will auto-detect it's a Next.js app

### 2.3 Configure Environment Variables
In Vercel dashboard → Project Settings → Environment Variables, add:

```bash
# Database
DATABASE_URL="your-planetscale-connection-string"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
NEXTAUTH_URL="https://your-vercel-app.vercel.app"

# API-Football (RapidAPI)
RAPIDAPI_KEY="your-rapidapi-key-from-rapidapi"

# Cron Security
CRON_SECRET="generate-another-random-secret"

# Environment
NODE_ENV="production"
```

### 2.4 Get API-Football Key
1. Go to [RapidAPI](https://rapidapi.com/api-sports/api/api-football)
2. Subscribe to free plan (100 requests/day)
3. Copy your API key

## ⚙️ Step 3: Configure Live Scores Polling

### 3.1 Vercel Cron Setup
The `vercel.json` file configures intelligent polling system:

```json
{
  "crons": [
    {
      "path": "/api/live-scores/match-window-check",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/live-scores/cron", 
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**How Smart Polling Works:**
- **Daily Check**: Runs at 6 AM to analyze upcoming matches
- **Smart Polling**: Every 5 minutes, but only during match windows
- **Automatic Skip**: No API calls when no matches are happening
- **Ultra Efficient**: 90% fewer API calls on non-match days

### 3.2 Test Cron Endpoint
After deployment, test the cron manually:
```bash
curl -X POST https://your-app.vercel.app/api/live-scores/cron
```

## 🗄️ Alternative Database Options

### Option 1: PlanetScale (Recommended)
- ✅ 5GB free storage
- ✅ MySQL compatible
- ✅ Global edge network
- ✅ Branch-based schema changes

### Option 2: Supabase
- ✅ 500MB free storage
- ✅ PostgreSQL
- ✅ Built-in auth (can replace NextAuth)
- ✅ Real-time subscriptions

### Option 3: Vercel Postgres
- ✅ 256MB free storage
- ✅ Integrated with Vercel
- ⚠️ Limited storage

## 📊 Usage Limits (Free Tiers)

### Vercel (Free)
- ✅ 100GB bandwidth/month
- ✅ 100 deployments/day
- ✅ Serverless function execution
- ✅ Custom domains

### PlanetScale (Free)
- ✅ 5GB storage
- ✅ 1 billion reads/month
- ✅ 10 million writes/month

### API-Football (Free)
- ✅ 100 requests/day
- ✅ Smart polling uses ~20-40 calls on match days
- ✅ 0 calls on non-match days

## 🔧 Monitoring & Maintenance

### Check Cron Jobs
Monitor your cron jobs in Vercel dashboard:
- Functions → Cron Jobs
- View execution logs and errors

### Database Monitoring
PlanetScale provides:
- Query insights
- Performance metrics
- Storage usage

### API Usage
Track API-Football usage in RapidAPI dashboard.

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Verify DATABASE_URL is correct
- Check PlanetScale connection status
- Ensure Prisma schema is pushed

**2. Cron Jobs Not Running**
- Check Vercel function logs
- Verify `vercel.json` syntax
- Test manual cron endpoint

**3. API-Football Limit Exceeded**
- Check RapidAPI usage dashboard
- Reduce polling frequency if needed
- Consider upgrading plan if popular

### Environment Variables
Double-check all environment variables in Vercel dashboard match your `.env.example`.

## 🎉 You're Live!

Your Premier League predictions app is now:
- ✅ **Deployed for free** on Vercel
- ✅ **Database hosted for free** on PlanetScale
- ✅ **Live scores updating** every 15 minutes
- ✅ **Real-time updates** via SSE
- ✅ **Scalable** to handle many users

**Total Cost: $0/month** (with optional $10/year for custom domain)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Guide](https://planetscale.com/docs)
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [Prisma with PlanetScale](https://www.prisma.io/docs/guides/database/planetscale)