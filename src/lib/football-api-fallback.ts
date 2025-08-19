// Fallback mock data for development when API key is not available
import { APIFootballTeam, APIFootballFixture } from './football-api';

export const mockPremierLeagueTeams: APIFootballTeam[] = [
  {
    id: 33,
    name: "Manchester United",
    code: "MUN",
    country: "England",
    founded: 1878,
    national: false,
    logo: "https://media.api-sports.io/football/teams/33.png",
    venue: {
      id: 556,
      name: "Old Trafford",
      address: "Sir Matt Busby Way",
      city: "Manchester",
      capacity: 76212,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/556.png"
    }
  },
  {
    id: 34,
    name: "Newcastle United",
    code: "NEW",
    country: "England", 
    founded: 1892,
    national: false,
    logo: "https://media.api-sports.io/football/teams/34.png",
    venue: {
      id: 562,
      name: "St. James' Park",
      address: "Barrack Road",
      city: "Newcastle upon Tyne",
      capacity: 52305,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/562.png"
    }
  },
  {
    id: 40,
    name: "Liverpool",
    code: "LIV",
    country: "England",
    founded: 1892,
    national: false,
    logo: "https://media.api-sports.io/football/teams/40.png",
    venue: {
      id: 550,
      name: "Anfield",
      address: "Anfield Road",
      city: "Liverpool",
      capacity: 54074,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/550.png"
    }
  },
  {
    id: 42,
    name: "Arsenal",
    code: "ARS",
    country: "England",
    founded: 1886,
    national: false,
    logo: "https://media.api-sports.io/football/teams/42.png",
    venue: {
      id: 494,
      name: "Emirates Stadium",
      address: "Queensland Road",
      city: "London",
      capacity: 60260,
      surface: "grass", 
      image: "https://media.api-sports.io/football/venues/494.png"
    }
  },
  {
    id: 47,
    name: "Tottenham",
    code: "TOT",
    country: "England",
    founded: 1882,
    national: false,
    logo: "https://media.api-sports.io/football/teams/47.png",
    venue: {
      id: 562,
      name: "Tottenham Hotspur Stadium",
      address: "782 High Road",
      city: "London",
      capacity: 62850,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/562.png"
    }
  },
  {
    id: 50,
    name: "Manchester City",
    code: "MCI",
    country: "England",
    founded: 1880,
    national: false,
    logo: "https://media.api-sports.io/football/teams/50.png",
    venue: {
      id: 555,
      name: "Etihad Stadium",
      address: "Etihad Campus",
      city: "Manchester",
      capacity: 55097,
      surface: "grass",
      image: "https://media.api-sports.io/football/venues/555.png"
    }
  }
  // Add more teams as needed...
];

export const mockPremierLeagueFixtures: APIFootballFixture[] = [
  {
    fixture: {
      id: 868086,
      referee: "Michael Oliver",
      timezone: "UTC",
      date: "2025-01-18T15:00:00+00:00",
      timestamp: 1737212400,
      periods: {
        first: 1737212400,
        second: null
      },
      venue: {
        id: 550,
        name: "Anfield",
        city: "Liverpool"
      },
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 21"
    },
    teams: {
      home: {
        id: 40,
        name: "Liverpool",
        logo: "https://media.api-sports.io/football/teams/40.png",
        winner: null
      },
      away: {
        id: 50,
        name: "Manchester City",
        logo: "https://media.api-sports.io/football/teams/50.png",
        winner: null
      }
    },
    goals: {
      home: null,
      away: null
    },
    score: {
      halftime: {
        home: null,
        away: null
      },
      fulltime: {
        home: null,
        away: null
      },
      extratime: {
        home: null,
        away: null
      },
      penalty: {
        home: null,
        away: null
      }
    }
  },
  {
    fixture: {
      id: 868087,
      referee: "Anthony Taylor",
      timezone: "UTC", 
      date: "2025-01-18T17:30:00+00:00",
      timestamp: 1737221400,
      periods: {
        first: null,
        second: null
      },
      venue: {
        id: 494,
        name: "Emirates Stadium", 
        city: "London"
      },
      status: {
        long: "Not Started",
        short: "NS",
        elapsed: null
      }
    },
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2024,
      round: "Regular Season - 21"
    },
    teams: {
      home: {
        id: 42,
        name: "Arsenal",
        logo: "https://media.api-sports.io/football/teams/42.png",
        winner: null
      },
      away: {
        id: 33,
        name: "Manchester United",
        logo: "https://media.api-sports.io/football/teams/33.png",
        winner: null
      }
    },
    goals: {
      home: null,
      away: null
    },
    score: {
      halftime: {
        home: null,
        away: null
      },
      fulltime: {
        home: null,
        away: null
      },
      extratime: {
        home: null,
        away: null
      },
      penalty: {
        home: null,
        away: null
      }
    }
  }
];