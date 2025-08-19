// Friends system data structures and mock data

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email?: string;
  status: 'accepted' | 'pending_sent' | 'pending_received' | 'blocked';
  addedAt: string;
  lastSeen?: string;
  totalPoints: number;
  currentRank: number;
  mutualFriends: number;
  favoriteTeam?: string;
  joinedAt: string;
  isOnline?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    totalPoints: number;
    currentRank: number;
  };
  message?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface SocialActivity {
  id: string;
  type: 'friend_added' | 'prediction_made' | 'achievement_unlocked' | 'rank_improved' | 'league_joined';
  userId: string;
  userName: string;
  userAvatar: string;
  description: string;
  details?: {
    rank?: number;
    points?: number;
    achievement?: string;
    prediction?: string;
    leagueName?: string;
  };
  timestamp: string;
  isVisible: boolean;
}

// Mock friends data
export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'Alex Thompson',
    username: 'PredictionKing92',
    avatar: '🤴',
    email: 'alex@example.com',
    status: 'accepted',
    addedAt: '2024-07-15T09:30:00Z',
    lastSeen: '2024-08-20T14:30:00Z',
    totalPoints: 89,
    currentRank: 1,
    mutualFriends: 3,
    favoriteTeam: 'Manchester City',
    joinedAt: '2024-07-15T09:30:00Z',
    isOnline: true
  },
  {
    id: 'friend-2',
    name: 'Sarah Johnson',
    username: 'FootyOracle',
    avatar: '🧙‍♀️',
    email: 'sarah@example.com',
    status: 'accepted',
    addedAt: '2024-07-20T14:15:00Z',
    lastSeen: '2024-08-19T16:45:00Z',
    totalPoints: 84,
    currentRank: 2,
    mutualFriends: 2,
    favoriteTeam: 'Liverpool',
    joinedAt: '2024-07-20T14:15:00Z',
    isOnline: false
  },
  {
    id: 'friend-3',
    name: 'Mike Chen',
    username: 'StatsMaster',
    avatar: '📊',
    email: 'mike@example.com',
    status: 'accepted',
    addedAt: '2024-07-22T11:00:00Z',
    lastSeen: '2024-08-20T10:15:00Z',
    totalPoints: 78,
    currentRank: 3,
    mutualFriends: 1,
    favoriteTeam: 'Chelsea',
    joinedAt: '2024-07-22T11:00:00Z',
    isOnline: true
  },
  {
    id: 'friend-4',
    name: 'Emma Wilson',
    username: 'GoalGetter',
    avatar: '⚽',
    email: 'emma@example.com',
    status: 'pending_sent',
    addedAt: '2024-08-18T15:30:00Z',
    totalPoints: 72,
    currentRank: 4,
    mutualFriends: 0,
    favoriteTeam: 'Manchester United',
    joinedAt: '2024-07-28T16:45:00Z',
    isOnline: false
  }
];

// Mock friend requests
export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req-1',
    fromUserId: 'user-9',
    toUserId: 'user-1',
    fromUser: {
      id: 'user-9',
      name: 'James Rodriguez',
      username: 'TacticalGenius',
      avatar: '🧠',
      totalPoints: 65,
      currentRank: 5
    },
    message: 'Hey! I saw your predictions and they\'re really good. Want to be friends and compare our performance?',
    createdAt: '2024-08-19T12:30:00Z',
    status: 'pending'
  },
  {
    id: 'req-2',
    fromUserId: 'user-10',
    toUserId: 'user-1',
    fromUser: {
      id: 'user-10',
      name: 'Sophie Brown',
      username: 'LuckyCharm',
      avatar: '🍀',
      totalPoints: 58,
      currentRank: 6
    },
    message: 'Would love to connect and see how we compare!',
    createdAt: '2024-08-20T09:15:00Z',
    status: 'pending'
  }
];

// Mock social activity
export const MOCK_SOCIAL_ACTIVITY: SocialActivity[] = [
  {
    id: 'activity-1',
    type: 'rank_improved',
    userId: 'friend-1',
    userName: 'Alex Thompson',
    userAvatar: '🤴',
    description: 'moved up to #1 in the rankings!',
    details: { rank: 1, points: 89 },
    timestamp: '2024-08-20T14:30:00Z',
    isVisible: true
  },
  {
    id: 'activity-2',
    type: 'achievement_unlocked',
    userId: 'friend-2',
    userName: 'Sarah Johnson',
    userAvatar: '🧙‍♀️',
    description: 'unlocked the "Upset Master" achievement!',
    details: { achievement: 'Upset Master' },
    timestamp: '2024-08-20T12:15:00Z',
    isVisible: true
  },
  {
    id: 'activity-3',
    type: 'prediction_made',
    userId: 'friend-3',
    userName: 'Mike Chen',
    userAvatar: '📊',
    description: 'made predictions for Gameweek 5',
    details: { prediction: 'Gameweek 5' },
    timestamp: '2024-08-20T10:45:00Z',
    isVisible: true
  },
  {
    id: 'activity-4',
    type: 'friend_added',
    userId: 'user-1',
    userName: 'You',
    userAvatar: '👤',
    description: 'added Mike Chen as a friend',
    timestamp: '2024-08-19T16:30:00Z',
    isVisible: true
  }
];

// Helper functions
export const getFriends = (): Friend[] => {
  return MOCK_FRIENDS.filter(friend => friend.status === 'accepted');
};

export const getPendingRequests = (): FriendRequest[] => {
  return MOCK_FRIEND_REQUESTS.filter(req => req.status === 'pending');
};

export const getSentRequests = (): Friend[] => {
  return MOCK_FRIENDS.filter(friend => friend.status === 'pending_sent');
};

export const getFriendById = (id: string): Friend | undefined => {
  return MOCK_FRIENDS.find(friend => friend.id === id);
};

export const getOnlineFriends = (): Friend[] => {
  return getFriends().filter(friend => friend.isOnline);
};

export const searchFriends = (query: string): Friend[] => {
  const lowercaseQuery = query.toLowerCase();
  return getFriends().filter(friend => 
    friend.name.toLowerCase().includes(lowercaseQuery) ||
    friend.username.toLowerCase().includes(lowercaseQuery)
  );
};

export const getSocialActivity = (limit?: number): SocialActivity[] => {
  const activities = MOCK_SOCIAL_ACTIVITY.filter(activity => activity.isVisible);
  return limit ? activities.slice(0, limit) : activities;
};

export const getFriendStats = () => {
  const friends = getFriends();
  return {
    totalFriends: friends.length,
    onlineFriends: getOnlineFriends().length,
    pendingRequests: getPendingRequests().length,
    mutualConnections: friends.reduce((sum, friend) => sum + friend.mutualFriends, 0)
  };
};

// Mock functions for friend operations (in real app these would be API calls)
export const sendFriendRequest = async (userId: string, message?: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const declineFriendRequest = async (requestId: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const removeFriend = async (friendId: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const blockUser = async (userId: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};