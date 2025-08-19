// API-Football integration via RapidAPI
// Docs: https://www.api-football.com/documentation-v3

const API_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';

// Premier League league ID (API-Football uses 39 for Premier League)
export const PREMIER_LEAGUE_ID = 39;
export const CURRENT_SEASON = 2025; // 2025-26 season (upcoming season for predictions)

export interface APIFootballTeam {
  team: {
    id: number;
    name: string;
    code: string; // Three letter code
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface APIFootballFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string; // "Not Started", "Match Finished", etc.
      short: string; // "NS", "FT", "1H", "2H", etc.
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string; // "Regular Season - 1", "Regular Season - 2", etc.
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface APIFootballStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

class APIFootballService {
  async makeRequest(endpoint: string): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY environment variable is not set');
    }

    const headers: HeadersInit = {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    };

    console.log(`🏈 API-Football Request: ${url}`);
    
    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Football Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        throw new Error(`API-Football Error: ${data.errors.join(', ')}`);
      }

      console.log(`✅ API-Football Response: ${data.results || 0} results`);
      return data;
    } catch (error) {
      console.error('❌ API-Football Error:', error);
      throw error;
    }
  }

  // Get Premier League teams for current season
  async getPremierLeagueTeams(): Promise<{ response: APIFootballTeam[] }> {
    return this.makeRequest(`/teams?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
  }

  // Get Premier League fixtures
  async getPremierLeagueFixtures(round?: number): Promise<{ response: APIFootballFixture[] }> {
    let endpoint = `/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`;
    
    if (round) {
      endpoint += `&round=Regular Season - ${round}`;
    }
    
    return this.makeRequest(endpoint);
  }

  // Get fixtures for a specific date range
  async getFixturesByDateRange(dateFrom: string, dateTo: string): Promise<{ response: APIFootballFixture[] }> {
    return this.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&from=${dateFrom}&to=${dateTo}`);
  }

  // Get current Premier League standings
  async getPremierLeagueStandings(): Promise<{ response: Array<{ league: { standings: APIFootballStanding[][] } }> }> {
    return this.makeRequest(`/standings?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
  }

  // Get a specific fixture by ID
  async getFixture(fixtureId: number): Promise<{ response: APIFootballFixture[] }> {
    return this.makeRequest(`/fixtures?id=${fixtureId}`);
  }

  // Get live fixtures
  async getLiveFixtures(): Promise<{ response: APIFootballFixture[] }> {
    return this.makeRequest(`/fixtures?live=all`);
  }

  // Get fixtures for today
  async getTodaysFixtures(): Promise<{ response: APIFootballFixture[] }> {
    const today = new Date().toISOString().split('T')[0];
    return this.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&date=${today}`);
  }

  // Get next round of fixtures
  async getNextRoundFixtures(): Promise<{ response: APIFootballFixture[] }> {
    return this.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&next=10`);
  }

  // Get current season info to check if it's active
  async getCurrentSeasonInfo(): Promise<any> {
    return this.makeRequest(`/leagues?id=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
  }

  // Smart method to get upcoming fixtures regardless of season
  async getUpcomingFixtures(limit: number = 10): Promise<{ response: APIFootballFixture[] }> {
    try {
      // Try current season first
      const current = await this.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&next=${limit}`);
      if (current.response.length > 0) {
        return current;
      }
      
      // If no fixtures in current season, try next season
      const nextSeason = CURRENT_SEASON + 1;
      return await this.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${nextSeason}&next=${limit}`);
    } catch (error) {
      console.warn('Could not get upcoming fixtures, falling back to next method');
      throw error;
    }
  }
}

export const apiFootball = new APIFootballService();