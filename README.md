# ⚽ Premier League Predictions App

A modern, real-time web application for predicting Premier League match scores with live updates, intelligent gameweek management, and comprehensive analytics.

## ✨ Features

### 🎯 **Smart Predictions**
- Intelligent gameweek defaults (upcoming for predictions, recent for results)
- Real-time score updates via Server-Sent Events (SSE)
- Advanced scoring system with bonus points
- Batch submission workflow with draft/submit states

### 📊 **Live Scores & Analytics**
- Real-time match tracking with live indicators
- Automatic fixture and score synchronization
- Performance analytics and accuracy tracking
- Comprehensive leaderboard with achievements

### 🔐 **Authentication & User Management**
- Secure user registration and login
- Profile management with detailed stats
- Session-based authentication with NextAuth.js

### ⚡ **Real-time Updates**
- Server-Sent Events for live match updates
- Smart cron scheduling (only during match windows)
- Background polling service with automatic match detection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (we recommend [Supabase](https://supabase.com))
- RapidAPI account for [API-Football](https://rapidapi.com/api-sports/api/api-football)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/prediction-app.git
cd prediction-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🔧 Configuration

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API-Football (RapidAPI)
RAPIDAPI_KEY="your-rapidapi-key"

# Cron Security
CRON_SECRET="random-secret-string"

# Environment
NODE_ENV="development"
```

## 📱 Screenshots

[Add screenshots here]

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel with cron jobs
- **External API**: API-Football via RapidAPI

## 🎮 Usage

### For Users
1. **Sign Up/Login**: Create an account or sign in
2. **Make Predictions**: Navigate to predictions page and predict upcoming matches
3. **Track Results**: View your prediction accuracy and points on the results page
4. **Check Leaderboard**: See how you rank against other users
5. **Live Updates**: Watch live scores update automatically during matches

### For Admins
1. **Access Admin Panel**: Visit `/admin` (requires admin privileges)
2. **Sync Teams**: Import Premier League teams from API-Football
3. **Sync Fixtures**: Import match fixtures for the current season
4. **Monitor Live Scores**: Background service automatically updates scores during matches

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/prediction-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy with automatic cron jobs

3. **Set up Database**:
   ```bash
   npx prisma db push
   ```

4. **Initialize Data**:
   - Visit `/admin` on your deployed app
   - Sync teams and fixtures

See [docs/README-DEPLOYMENT.md](docs/README-DEPLOYMENT.md) for detailed deployment instructions.

## 📖 Documentation

- [Database Setup](docs/DATABASE_SETUP.md) - PostgreSQL and Prisma configuration
- [RapidAPI Setup](docs/RAPIDAPI_SETUP.md) - API-Football integration guide
- [Deployment Guide](docs/README-DEPLOYMENT.md) - Production deployment instructions
- [Phase Documentation](docs/) - Development phase details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **API-Football** for providing Premier League data
- **Vercel** for hosting and serverless functions
- **Prisma** for database ORM
- **NextAuth.js** for authentication
- **Tailwind CSS** for styling

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review the [troubleshooting guide](docs/README-DEPLOYMENT.md#troubleshooting)

---

**⭐ If you found this project helpful, please consider giving it a star!**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fprediction-app)