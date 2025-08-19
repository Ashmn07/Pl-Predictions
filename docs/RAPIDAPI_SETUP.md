# API-Football Setup Instructions

## 1. Sign up for RapidAPI

1. Go to https://rapidapi.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

## 2. Subscribe to API-Football

1. Visit https://rapidapi.com/api-sports/api/api-football
2. Click "Subscribe to Test" 
3. Select the **Basic plan (FREE)** which includes:
   - 100 requests per day
   - All endpoints access
   - Limited to current season data

## 3. Get Your API Key

1. After subscribing, you'll see your API key on the API page
2. Copy the "X-RapidAPI-Key" value from the code examples
3. Update your `.env.local` file:

```bash
# Replace 'your-rapidapi-key-here' with your actual API key
RAPIDAPI_KEY="your-actual-rapidapi-key-from-rapidapi-dashboard"
```

## 4. Test the Integration

Once you've set up the API key, you can test the integration by visiting:

- Premier League Teams: http://localhost:3000/api/football/teams
- Premier League Fixtures: http://localhost:3000/api/football/fixtures
- Next Round Fixtures: http://localhost:3000/api/football/fixtures?next=true

## 5. API Rate Limits

**Free Tier (100 requests/day):**
- Perfect for development and testing
- Roughly 3 requests per hour if spread evenly
- Current season data only
- Live scores with 15-second updates

## 6. Available Endpoints

Our integration provides:
- `getPremierLeagueTeams()` - Get all 20 PL teams
- `getPremierLeagueFixtures(round?)` - Get fixtures by round/gameweek  
- `getNextRoundFixtures()` - Get upcoming fixtures
- `getTodaysFixtures()` - Get today's matches
- `getPremierLeagueStandings()` - Get current league table
- `getFixture(id)` - Get specific match details

## Troubleshooting

- **"RAPIDAPI_KEY environment variable is not set"** → Add your API key to `.env.local`
- **"403 Forbidden"** → Check if you're subscribed to the API
- **"Rate limit exceeded"** → You've hit the 100 daily requests limit
- **"No data"** → The free tier might have limited historical data

## Next Steps

After setup, we'll use this API to:
1. Seed our database with real PL teams
2. Import current season fixtures  
3. Set up automated score updates
4. Replace mock data with live data