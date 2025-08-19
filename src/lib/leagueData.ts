import { MOCK_USERS } from './mockUsers';

export interface League {
  id: string;
  name: string;
  description: string;
  type: 'private' | 'public';
  createdBy: string;
  createdAt: string;
  memberCount: number;
  maxMembers?: number;
  isActive: boolean;
  prize?: string;
  rules?: string[];
  joinCode?: string;
  season: string;
  avatar?: string;
}

export interface LeagueMember {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  joinedAt: string;
  role: 'owner' | 'admin' | 'member';
  currentRank: number;
  points: number;
  predictions: number;
  accuracy: number;
}

export interface LeagueInvitation {
  id: string;
  leagueId: string;
  leagueName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface CreateLeagueData {
  name: string;
  description: string;
  type: 'private' | 'public';
  maxMembers?: number;
  prize?: string;
  rules?: string[];
}

export const MOCK_LEAGUES: League[] = [
  {
    id: 'league-1',
    name: 'Premier Predictors United',
    description: 'A competitive league for serious Premier League fans who love making predictions!',
    type: 'private',
    createdBy: 'user-1',
    createdAt: '2024-08-01T10:00:00Z',
    memberCount: 12,
    maxMembers: 20,
    isActive: true,
    prize: '£100 Amazon Voucher for Season Winner',
    rules: [
      'All predictions must be submitted 1 hour before kickoff',
      'No changing predictions once matches start',
      'Respectful behavior required at all times',
      'Minimum 80% prediction rate to qualify for prizes'
    ],
    joinCode: 'PPU2024',
    season: '2024/25',
    avatar: '⚽'
  },
  {
    id: 'league-2',
    name: 'Office Warriors FC',
    description: 'Workplace league for the marketing department. May the best predictor win!',
    type: 'private',
    createdBy: 'user-3',
    createdAt: '2024-07-28T14:30:00Z',
    memberCount: 8,
    maxMembers: 15,
    isActive: true,
    prize: 'Winner buys lunch for everyone',
    rules: [
      'Open to marketing team members only',
      'Good-natured banter encouraged',
      'No actual money involved, just pride!'
    ],
    joinCode: 'OFFICE24',
    season: '2024/25',
    avatar: '🏢'
  },
  {
    id: 'league-3',
    name: 'Global Champions League',
    description: 'Open to everyone! Join the largest prediction community.',
    type: 'public',
    createdBy: 'user-5',
    createdAt: '2024-07-15T09:00:00Z',
    memberCount: 2847,
    isActive: true,
    season: '2024/25',
    avatar: '🌍'
  }
];

export const MOCK_LEAGUE_MEMBERS: { [leagueId: string]: LeagueMember[] } = {
  'league-1': [
    {
      userId: 'user-1',
      username: 'alexchen',
      displayName: 'Alex Chen',
      avatar: '👨‍💼',
      joinedAt: '2024-08-01T10:00:00Z',
      role: 'owner',
      currentRank: 1,
      points: 245,
      predictions: 28,
      accuracy: 78.6
    },
    {
      userId: 'user-2',
      username: 'sarahj',
      displayName: 'Sarah Johnson',
      avatar: '👩‍💻',
      joinedAt: '2024-08-01T15:30:00Z',
      role: 'admin',
      currentRank: 2,
      points: 232,
      predictions: 27,
      accuracy: 74.1
    },
    {
      userId: 'user-3',
      username: 'mikebrown',
      displayName: 'Mike Brown',
      avatar: '👨‍🎨',
      joinedAt: '2024-08-02T09:15:00Z',
      role: 'member',
      currentRank: 3,
      points: 218,
      predictions: 26,
      accuracy: 69.2
    }
  ],
  'league-2': [
    {
      userId: 'user-3',
      username: 'mikebrown',
      displayName: 'Mike Brown',
      avatar: '👨‍🎨',
      joinedAt: '2024-07-28T14:30:00Z',
      role: 'owner',
      currentRank: 1,
      points: 201,
      predictions: 25,
      accuracy: 72.0
    },
    {
      userId: 'user-4',
      username: 'emilyd',
      displayName: 'Emily Davis',
      avatar: '👩‍🔬',
      joinedAt: '2024-07-29T11:20:00Z',
      role: 'member',
      currentRank: 2,
      points: 189,
      predictions: 24,
      accuracy: 66.7
    }
  ]
};

export const MOCK_LEAGUE_INVITATIONS: LeagueInvitation[] = [
  {
    id: 'inv-1',
    leagueId: 'league-1',
    leagueName: 'Premier Predictors United',
    fromUserId: 'user-1',
    fromUserName: 'Alex Chen',
    toUserId: 'current-user',
    message: 'Hey! Join our league - we have some great competition and prizes!',
    status: 'pending',
    createdAt: '2024-08-08T16:45:00Z',
    expiresAt: '2024-08-15T16:45:00Z'
  },
  {
    id: 'inv-2',
    leagueId: 'league-2',
    leagueName: 'Office Warriors FC',
    fromUserId: 'user-3',
    fromUserName: 'Mike Brown',
    toUserId: 'current-user',
    message: 'Join our office league! It\'s just for fun and bragging rights.',
    status: 'pending',
    createdAt: '2024-08-07T10:30:00Z',
    expiresAt: '2024-08-14T10:30:00Z'
  }
];

// Helper functions for league management
export const createLeague = async (data: CreateLeagueData): Promise<League> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newLeague: League = {
    id: `league-${Date.now()}`,
    ...data,
    createdBy: 'current-user',
    createdAt: new Date().toISOString(),
    memberCount: 1,
    isActive: true,
    joinCode: data.type === 'private' ? generateJoinCode() : undefined,
    season: '2024/25',
    avatar: getRandomLeagueAvatar()
  };
  
  return newLeague;
};

export const joinLeague = async (leagueId: string, joinCode?: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const league = MOCK_LEAGUES.find(l => l.id === leagueId);
  if (!league) throw new Error('League not found');
  
  if (league.type === 'private' && league.joinCode !== joinCode) {
    throw new Error('Invalid join code');
  }
  
  if (league.maxMembers && league.memberCount >= league.maxMembers) {
    throw new Error('League is full');
  }
  
  // In real app, would add user to league members
  console.log(`Joined league: ${league.name}`);
};

export const leaveLeague = async (leagueId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Left league: ${leagueId}`);
};

export const inviteToLeague = async (
  leagueId: string, 
  userId: string, 
  message?: string
): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Invited user ${userId} to league ${leagueId}`);
};

export const respondToLeagueInvitation = async (
  invitationId: string, 
  response: 'accept' | 'decline'
): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`${response}ed invitation ${invitationId}`);
};

export const updateLeague = async (
  leagueId: string, 
  updates: Partial<CreateLeagueData>
): Promise<League> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const league = MOCK_LEAGUES.find(l => l.id === leagueId);
  if (!league) throw new Error('League not found');
  
  const updatedLeague = { ...league, ...updates };
  return updatedLeague;
};

export const deleteLeague = async (leagueId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Deleted league: ${leagueId}`);
};

// Utility functions
const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getRandomLeagueAvatar = (): string => {
  const avatars = ['⚽', '🏆', '👥', '🎯', '🔥', '⭐', '💪', '🚀', '🏅', '⚡'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

export const getLeaguesByUser = (userId: string): League[] => {
  // In real app, would fetch user's leagues from API
  return MOCK_LEAGUES.filter(league => 
    league.createdBy === userId || 
    Object.values(MOCK_LEAGUE_MEMBERS).some(members => 
      members.some(member => member.userId === userId)
    )
  );
};

export const searchLeagues = (query: string): League[] => {
  if (!query.trim()) return MOCK_LEAGUES.filter(l => l.type === 'public').slice(0, 10);
  
  return MOCK_LEAGUES.filter(league => 
    league.name.toLowerCase().includes(query.toLowerCase()) ||
    league.description.toLowerCase().includes(query.toLowerCase())
  );
};