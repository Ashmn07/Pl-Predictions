// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  description?: string;
}

// User types (for later use)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  rank: number;
}

// Match types (for later use)
export interface Team {
  id: string;
  name: string;
  logo: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string;
  gameweek: number;
  season: string;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
}

// Prediction types (for later use)
export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  createdAt: string;
  updatedAt: string;
}