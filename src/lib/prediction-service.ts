// Database-backed prediction service
import { PredictionType } from '@prisma/client';

export interface DatabasePrediction {
  id: string;
  fixtureId: string;
  prediction: PredictionType;
  confidence: number;
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
  fixture: {
    id: string;
    gameweek: number;
    season: string;
    kickoffTime: string;
    status: string;
    homeTeam: {
      id: string;
      name: string;
      logoUrl: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logoUrl: string;
    };
    homeScore: number | null;
    awayScore: number | null;
  };
}

export interface DatabaseUserStats {
  totalPoints: number;
  currentRank: number | null;
  predictionsMade: number;
  accuracyRate: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  lastUpdated: string;
}

export class PredictionService {
  private async makeRequest(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Get user's predictions for a specific gameweek
  async getPredictionsByGameweek(gameweek: number, season: string = '2025-26'): Promise<DatabasePrediction[]> {
    const response = await this.makeRequest(
      `/api/predictions?gameweek=${gameweek}&season=${encodeURIComponent(season)}`
    );
    return response.predictions || [];
  }

  // Get all user's predictions
  async getAllPredictions(): Promise<DatabasePrediction[]> {
    const response = await this.makeRequest('/api/predictions');
    return response.predictions || [];
  }

  // Get a specific prediction by fixture ID
  async getPrediction(fixtureId: string): Promise<DatabasePrediction | null> {
    try {
      const response = await this.makeRequest(`/api/predictions?fixtureId=${fixtureId}`);
      return response.predictions?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  // Save a prediction (create or update)
  async savePrediction(
    fixtureId: string, 
    prediction: PredictionType, 
    confidence: number = 80
  ): Promise<DatabasePrediction> {
    return await this.makeRequest('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({
        fixtureId,
        prediction,
        confidence,
      }),
    });
  }

  // Submit predictions (mark as submitted)
  async submitPredictions(fixtureIds: string[]): Promise<boolean> {
    try {
      await this.makeRequest('/api/predictions/submit', {
        method: 'POST',
        body: JSON.stringify({ fixtureIds }),
      });
      return true;
    } catch (error) {
      console.error('Failed to submit predictions:', error);
      return false;
    }
  }

  // Get user stats
  async getUserStats(): Promise<DatabaseUserStats> {
    const response = await this.makeRequest('/api/users/stats');
    return response.stats;
  }

  // Get fixtures for a gameweek
  async getFixtures(gameweek?: number, season: string = '2025-26'): Promise<any[]> {
    let url = '/api/fixtures';
    if (gameweek) {
      url += `?gameweek=${gameweek}&season=${encodeURIComponent(season)}`;
    }
    const response = await this.makeRequest(url);
    return response.fixtures || [];
  }

  // Get upcoming fixtures
  async getUpcomingFixtures(): Promise<any[]> {
    const response = await this.makeRequest('/api/fixtures?upcoming=true');
    return response.fixtures || [];
  }

  // Helper method to convert prediction types
  static predictionTypeFromScore(homeScore: number, awayScore: number): PredictionType {
    if (homeScore > awayScore) return 'HOME_WIN';
    if (awayScore > homeScore) return 'AWAY_WIN';
    return 'DRAW';
  }

  // Helper method to convert prediction type to readable string
  static predictionTypeToString(prediction: PredictionType): string {
    switch (prediction) {
      case 'HOME_WIN': return 'Home Win';
      case 'AWAY_WIN': return 'Away Win';
      case 'DRAW': return 'Draw';
    }
  }
}

export const predictionService = new PredictionService();