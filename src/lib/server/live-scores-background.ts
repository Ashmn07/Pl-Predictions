/**
 * Server-side background service for live scores polling
 * Runs on the server and broadcasts updates via SSE to all connected clients
 * Only makes API calls from the backend, not from frontend
 */

import { prisma } from '@/lib/prisma';
import { apiFootball } from '@/lib/football-api';

interface SSEClient {
  id: string;
  response: Response;
  controller: ReadableStreamDefaultController;
}

interface PollingStatus {
  isActive: boolean;
  lastPoll: Date | null;
  nextPoll: Date | null;
  totalPolls: number;
  errors: number;
  currentlyLive: number;
}

class BackgroundLiveScoresService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private sseClients: Map<string, SSEClient> = new Map();
  private status: PollingStatus = {
    isActive: false,
    lastPoll: null,
    nextPoll: null,
    totalPolls: 0,
    errors: 0,
    currentlyLive: 0
  };

  /**
   * Start the background polling service
   * This runs on the server every 15 minutes during live matches
   */
  async startPolling(): Promise<void> {
    if (this.pollingInterval) {
      console.log('⚠️ Background polling already active');
      return;
    }

    console.log('🚀 Starting background live scores polling service');
    
    // Start immediate poll
    await this.performPoll();
    
    // Set up 15-minute interval (server-side only)
    this.pollingInterval = setInterval(async () => {
      await this.performPoll();
    }, 15 * 60 * 1000); // 15 minutes

    this.status.isActive = true;
    this.updateNextPollTime();
  }

  /**
   * Stop the background polling service
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.status.isActive = false;
      this.status.nextPoll = null;
      console.log('⏹️ Background live scores polling stopped');
    }
  }

  /**
   * Perform a single poll for live scores (server-side only)
   */
  private async performPoll(): Promise<void> {
    try {
      console.log('🔄 Background polling: Fetching live scores from API...');
      
      // Fetch live fixtures from API-Football
      const liveResponse = await apiFootball.getLiveFixtures();
      const liveFixtures = liveResponse.response || [];
      
      let updatesCount = 0;
      const scoreUpdates: any[] = [];

      // Update database with new scores
      for (const fixture of liveFixtures) {
        try {
          const existingFixture = await prisma.fixture.findUnique({
            where: { apiId: fixture.fixture.id.toString() }
          });

          if (existingFixture) {
            // Check if scores have changed
            const oldHomeScore = existingFixture.homeScore;
            const oldAwayScore = existingFixture.awayScore;
            const newHomeScore = fixture.goals.home;
            const newAwayScore = fixture.goals.away;

            const scoreChanged = oldHomeScore !== newHomeScore || oldAwayScore !== newAwayScore;

            // Update fixture in database
            await prisma.fixture.update({
              where: { id: existingFixture.id },
              data: {
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                status: this.mapApiStatusToDb(fixture.fixture.status.short),
                statusLong: fixture.fixture.status.long,
                minute: fixture.fixture.status.elapsed || null
              }
            });

            if (scoreChanged) {
              updatesCount++;
              
              // Prepare SSE update
              const scoreUpdate = {
                id: existingFixture.id,
                homeTeam: existingFixture.homeTeam,
                awayTeam: existingFixture.awayTeam,
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                status: this.mapApiStatusToDb(fixture.fixture.status.short),
                scoreChanged: true,
                timestamp: new Date().toISOString()
              };
              
              scoreUpdates.push(scoreUpdate);
              
              console.log(`📊 Score update: ${existingFixture.homeTeam} ${newHomeScore}-${newAwayScore} ${existingFixture.awayTeam}`);
            }
          }
        } catch (dbError) {
          console.error('❌ Database update error for fixture:', fixture.fixture.id, dbError);
        }
      }
      
      this.status.lastPoll = new Date();
      this.status.totalPolls++;
      this.status.currentlyLive = liveFixtures.length;
      
      console.log(`✅ Background poll completed. Live matches: ${this.status.currentlyLive}, Updates: ${updatesCount}`);
      
      // Broadcast updates to all connected SSE clients
      if (scoreUpdates.length > 0) {
        this.broadcastScoreUpdates(scoreUpdates);
      }

      // Auto-stop if no live matches
      if (liveFixtures.length === 0) {
        console.log('🏁 No live matches found. Stopping background polling.');
        this.stopPolling();
        return;
      }

      // Update next poll time
      this.updateNextPollTime();

    } catch (error) {
      this.status.errors++;
      console.error('❌ Background polling error:', error);
      
      // Continue polling even on errors, just log and update next poll time
      this.updateNextPollTime();
    }
  }

  /**
   * Map API-Football status to database status
   */
  private mapApiStatusToDb(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      'NS': 'SCHEDULED',    // Not Started
      '1H': 'LIVE',         // First Half
      'HT': 'LIVE',         // Half Time
      '2H': 'LIVE',         // Second Half
      'ET': 'LIVE',         // Extra Time
      'BT': 'LIVE',         // Break Time (in ET)
      'P': 'LIVE',          // Penalty In Progress
      'FT': 'FINISHED',     // Full Time
      'AET': 'FINISHED',    // After Extra Time
      'PEN': 'FINISHED',    // Penalty Finished
      'PST': 'POSTPONED',   // Postponed
      'CANC': 'CANCELLED',  // Cancelled
      'ABD': 'ABANDONED',   // Abandoned
      'AWD': 'AWARDED',     // Technical Loss
      'WO': 'WALKOVER'      // WalkOver
    };
    
    return statusMap[apiStatus] || 'SCHEDULED';
  }

  /**
   * Update the next poll time
   */
  private updateNextPollTime(): void {
    if (this.status.isActive) {
      this.status.nextPoll = new Date(Date.now() + 15 * 60 * 1000);
    }
  }

  /**
   * Add SSE client to broadcast list
   */
  addSSEClient(clientId: string, client: SSEClient): void {
    this.sseClients.set(clientId, client);
    console.log(`📡 SSE client connected: ${clientId}. Total clients: ${this.sseClients.size}`);
  }

  /**
   * Remove SSE client from broadcast list
   */
  removeSSEClient(clientId: string): void {
    this.sseClients.delete(clientId);
    console.log(`📡 SSE client disconnected: ${clientId}. Total clients: ${this.sseClients.size}`);
  }

  /**
   * Broadcast score updates to all connected SSE clients
   */
  private broadcastScoreUpdates(updates: any[]): void {
    if (this.sseClients.size === 0) {
      console.log('📢 No SSE clients connected, skipping broadcast');
      return;
    }

    console.log(`📢 Broadcasting ${updates.length} score updates to ${this.sseClients.size} clients`);

    const message = {
      type: 'score-update',
      data: updates,
      timestamp: new Date().toISOString()
    };

    // Send to all connected clients
    for (const [clientId, client] of this.sseClients) {
      try {
        client.controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
        );
      } catch (error) {
        console.error(`❌ Failed to send to client ${clientId}:`, error);
        // Remove failed client
        this.removeSSEClient(clientId);
      }
    }
  }

  /**
   * Broadcast general status updates to SSE clients
   */
  broadcastStatusUpdate(status: any): void {
    const message = {
      type: 'status-update', 
      data: status,
      timestamp: new Date().toISOString()
    };

    for (const [clientId, client] of this.sseClients) {
      try {
        client.controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(message)}\n\n`)
        );
      } catch (error) {
        console.error(`❌ Failed to send status to client ${clientId}:`, error);
        this.removeSSEClient(clientId);
      }
    }
  }

  /**
   * Get current polling status
   */
  getStatus(): PollingStatus {
    return { ...this.status };
  }

  /**
   * Check if polling should be active based on current matches
   */
  async shouldBePolling(): Promise<boolean> {
    try {
      // Check database for live matches
      const liveMatches = await prisma.fixture.findMany({
        where: {
          status: 'LIVE'
        }
      });

      return liveMatches.length > 0;
    } catch (error) {
      console.error('❌ Error checking if should be polling:', error);
      return false;
    }
  }

  /**
   * Smart start - only start if matches are actually live
   */
  async smartStart(): Promise<void> {
    const shouldPoll = await this.shouldBePolling();
    
    if (shouldPoll && !this.status.isActive) {
      await this.startPolling();
    } else if (!shouldPoll && this.status.isActive) {
      this.stopPolling();
    } else {
      console.log(`ℹ️ Background polling status unchanged. Should poll: ${shouldPoll}, Is active: ${this.status.isActive}`);
    }
  }

  /**
   * Force a manual poll (for admin/testing)
   */
  async forcePoll(): Promise<any> {
    console.log('🔧 Manual background poll triggered');
    await this.performPoll();
    return this.getStatus();
  }
}

// Export singleton instance for server-side use
export const backgroundLiveScoresService = new BackgroundLiveScoresService();

/**
 * Initialize the background service when the server starts
 */
export async function initializeBackgroundLiveScores(): Promise<void> {
  console.log('🔧 Initializing background live scores service...');
  
  // Check if we should start polling immediately
  await backgroundLiveScoresService.smartStart();
  
  // Set up periodic check every hour to auto-start/stop polling
  setInterval(async () => {
    console.log('🔍 Background service: Checking if polling should be active...');
    await backgroundLiveScoresService.smartStart();
  }, 60 * 60 * 1000); // Check every hour
}

/**
 * Manual controls for admin interface
 */
export const backgroundPollingControls = {
  start: () => backgroundLiveScoresService.startPolling(),
  stop: () => backgroundLiveScoresService.stopPolling(),
  status: () => backgroundLiveScoresService.getStatus(),
  smartStart: () => backgroundLiveScoresService.smartStart(),
  forcePoll: () => backgroundLiveScoresService.forcePoll(),
  addClient: (id: string, client: any) => backgroundLiveScoresService.addSSEClient(id, client),
  removeClient: (id: string) => backgroundLiveScoresService.removeSSEClient(id)
};