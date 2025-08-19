/**
 * SSE-based hook for live scores
 * Connects to Server-Sent Events stream instead of polling
 * Provides real-time updates without any API calls from frontend
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LiveScoreUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  scoreChanged: boolean;
  timestamp: string;
}

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  statusLong: string | null;
  minute: number | null;
  kickoff: string;
  gameweek: number;
}

export interface LiveWindow {
  isLive: boolean;
  matchesCount: number;
  allMatchesFinished: boolean;
  nextMatchStart: string | null;
}

export interface PollingStatus {
  isActive: boolean;
  lastPoll: string | null;
  nextPoll: string | null;
  currentlyLive: number;
}

export interface LiveScoresSSEState {
  isConnected: boolean;
  isConnecting: boolean;
  liveMatches: LiveMatch[];
  liveWindow: LiveWindow | null;
  pollingStatus: PollingStatus | null;
  recentUpdates: LiveScoreUpdate[];
  lastUpdate: Date | null;
  error: string | null;
  connectionId: string | null;
}

export interface UseLiveScoresSSEOptions {
  autoConnect?: boolean;
  onUpdate?: (updates: LiveScoreUpdate[]) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Hook for receiving live score updates via SSE
 * Replaces polling-based approach with real-time server push
 */
export function useLiveScoresSSE(options: UseLiveScoresSSEOptions = {}) {
  const {
    autoConnect = true,
    onUpdate,
    onError,
    onConnect,
    onDisconnect
  } = options;

  const [state, setState] = useState<LiveScoresSSEState>({
    isConnected: false,
    isConnecting: false,
    liveMatches: [],
    liveWindow: null,
    pollingStatus: null,
    recentUpdates: [],
    lastUpdate: null,
    error: null,
    connectionId: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);

  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('⚠️ SSE already connected');
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    console.log('📡 Connecting to live scores SSE stream...');

    try {
      const eventSource = new EventSource('/api/live-scores/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ SSE connection established');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null
        }));
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleSSEMessage(message);
        } catch (error) {
          console.error('❌ Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Connection lost'
        }));

        // Close current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          const errorMsg = 'Failed to connect to live scores stream after multiple attempts';
          setState(prev => ({ ...prev, error: errorMsg }));
          onError?.(errorMsg);
        }
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to establish SSE connection';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMsg
      }));
      onError?.(errorMsg);
    }
  }, [onConnect, onError]);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('📡 SSE connection closed');
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionId: null
    }));

    onDisconnect?.();
  }, [onDisconnect]);

  /**
   * Handle incoming SSE messages
   */
  const handleSSEMessage = useCallback((message: any) => {
    const { type, data, timestamp } = message;

    switch (type) {
      case 'connection':
        console.log('📡 SSE connection confirmed:', data.clientId);
        setState(prev => ({
          ...prev,
          connectionId: data.clientId
        }));
        break;

      case 'initial-data':
        console.log('📡 Received initial live scores data');
        setState(prev => ({
          ...prev,
          liveMatches: data.liveMatches || [],
          liveWindow: data.liveWindow || null,
          pollingStatus: data.pollingStatus || null,
          lastUpdate: new Date(timestamp)
        }));
        break;

      case 'score-update':
        console.log(`📡 Received ${data.length} score updates`);
        setState(prev => ({
          ...prev,
          recentUpdates: data,
          lastUpdate: new Date(timestamp)
        }));

        // Update live matches with new scores
        setState(prev => ({
          ...prev,
          liveMatches: prev.liveMatches.map(match => {
            const update = data.find((u: LiveScoreUpdate) => u.id === match.id);
            if (update) {
              return {
                ...match,
                homeScore: update.homeScore,
                awayScore: update.awayScore,
                status: update.status
              };
            }
            return match;
          })
        }));

        // Call onUpdate callback
        if (onUpdate && data.length > 0) {
          onUpdate(data);
        }
        break;

      case 'status-update':
        console.log('📡 Received polling status update');
        setState(prev => ({
          ...prev,
          pollingStatus: data,
          lastUpdate: new Date(timestamp)
        }));
        break;

      case 'ping':
        // Keepalive ping, no action needed
        break;

      case 'error':
        console.error('📡 SSE error message:', data);
        setState(prev => ({
          ...prev,
          error: data.message || 'Unknown SSE error'
        }));
        onError?.(data.message || 'Unknown SSE error');
        break;

      default:
        console.log('📡 Unknown SSE message type:', type);
    }
  }, [onUpdate, onError]);

  /**
   * Manual refresh trigger (for compatibility with old polling API)
   */
  const refresh = useCallback(async (): Promise<LiveScoreUpdate[]> => {
    // SSE provides real-time updates, so just return recent updates
    console.log('🔄 Manual refresh requested (SSE provides real-time updates)');
    return state.recentUpdates;
  }, [state.recentUpdates]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    connectionId: state.connectionId,
    error: state.error,

    // Live scores data
    liveMatches: state.liveMatches,
    liveWindow: state.liveWindow,
    pollingStatus: state.pollingStatus,
    recentUpdates: state.recentUpdates,
    lastUpdate: state.lastUpdate,

    // Actions
    connect,
    disconnect,
    refresh,

    // Computed values (for compatibility with old hook)
    hasLiveMatches: state.liveWindow?.isLive === true,
    hasUpdates: state.recentUpdates.length > 0,
    hasErrors: state.error !== null,
    pollingActive: state.pollingStatus?.isActive === true,

    // Utilities (for compatibility with old hook)
    getScoreChange: (matchId: string) => {
      const update = state.recentUpdates.find(u => u.id === matchId);
      return update?.scoreChanged || false;
    },

    getMatchUpdate: (matchId: string) => {
      return state.recentUpdates.find(u => u.id === matchId) || null;
    },

    // Get live match data by ID
    getLiveMatch: (matchId: string) => {
      return state.liveMatches.find(m => m.id === matchId) || null;
    }
  };
}