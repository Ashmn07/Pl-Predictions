/**
 * SSE (Server-Sent Events) endpoint for real-time live score updates
 * Frontend clients connect to this stream to receive live updates without polling
 */

import { NextRequest } from 'next/server';
import { backgroundPollingControls } from '@/lib/server/live-scores-background';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/live-scores/stream
 * Establishes SSE connection for real-time live score updates
 */
export async function GET(request: NextRequest) {
  // Create a unique client ID
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`📡 New SSE connection: ${clientId}`);

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const welcomeMessage = {
        type: 'connection',
        data: { 
          clientId,
          message: 'Connected to live scores stream',
          timestamp: new Date().toISOString()
        }
      };
      
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(welcomeMessage)}\n\n`)
      );

      // Send initial live scores data
      sendInitialData(controller);

      // Register this client with the background service
      backgroundPollingControls.addClient(clientId, {
        id: clientId,
        response: new Response(),
        controller
      });

      // Send keepalive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`)
          );
        } catch (error) {
          console.log(`📡 Client ${clientId} keepalive failed, cleaning up`);
          clearInterval(keepAliveInterval);
          backgroundPollingControls.removeClient(clientId);
        }
      }, 30000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`📡 Client ${clientId} disconnected`);
        clearInterval(keepAliveInterval);
        backgroundPollingControls.removeClient(clientId);
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
        }
      });
    },

    cancel() {
      console.log(`📡 Client ${clientId} stream cancelled`);
      backgroundPollingControls.removeClient(clientId);
    }
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * Send initial live scores data to newly connected client
 */
async function sendInitialData(controller: ReadableStreamDefaultController): Promise<void> {
  try {
    // Get current live matches from database
    const liveMatches = await prisma.fixture.findMany({
      where: {
        status: {
          in: ['LIVE', 'SCHEDULED']
        },
        kickoffTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000)   // Next 24 hours
        }
      },
      orderBy: {
        kickoffTime: 'asc'
      }
    });

    // Get polling status
    const pollingStatus = backgroundPollingControls.status();

    // Prepare initial data message
    const initialData = {
      type: 'initial-data',
      data: {
        liveMatches: liveMatches.map(match => ({
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
          statusLong: match.statusLong,
          minute: match.minute,
          kickoff: match.kickoffTime.toISOString(),
          gameweek: match.gameweek
        })),
        liveWindow: {
          isLive: liveMatches.filter(m => m.status === 'LIVE').length > 0,
          matchesCount: liveMatches.filter(m => m.status === 'LIVE').length,
          allMatchesFinished: liveMatches.every(m => m.status === 'FINISHED'),
          nextMatchStart: liveMatches.find(m => m.status === 'SCHEDULED')?.kickoffTime.toISOString() || null
        },
        pollingStatus: {
          isActive: pollingStatus.isActive,
          lastPoll: pollingStatus.lastPoll?.toISOString() || null,
          nextPoll: pollingStatus.nextPoll?.toISOString() || null,
          currentlyLive: pollingStatus.currentlyLive
        }
      },
      timestamp: new Date().toISOString()
    };

    // Send initial data
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(initialData)}\n\n`)
    );

    console.log(`📡 Sent initial data: ${liveMatches.length} matches, ${liveMatches.filter(m => m.status === 'LIVE').length} live`);

  } catch (error) {
    console.error('❌ Error sending initial SSE data:', error);
    
    // Send error message to client
    const errorMessage = {
      type: 'error',
      data: { 
        message: 'Failed to load initial data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    };
    
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(errorMessage)}\n\n`)
    );
  }
}