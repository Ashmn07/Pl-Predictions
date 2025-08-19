'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { clearAllData } from '@/lib/storage';
import { useLiveScoresSSE } from '@/hooks/useLiveScoresSSE';

interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    teamsCreated?: number;
    fixturesNew?: number;
    fixturesUpdated?: number;
    totalScores?: number;
    teamsDeleted?: number;
    fixturesDeleted?: number;
    predictionsDeleted?: number;
  };
  apiCalls?: number;
  totalApiCalls?: number;
  existingTeams?: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [pollingStatus, setPollingStatus] = useState<any>(null);
  
  // Use live scores SSE hook for real-time status
  const { 
    liveWindow, 
    pollingActive, 
    lastUpdate, 
    hasLiveMatches,
    refresh: refreshLiveScores 
  } = useLiveScoresSSE({ autoConnect: false });

  // Check if user is admin
  const isAdmin = session?.user?.email === 'admin@plpredictions.com';

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth');
      return;
    }
    
    if (!isAdmin) {
      router.push('/'); // Redirect non-admin users
      return;
    }
    
    // Load initial sync status
    fetchSyncStatus();
  }, [session, status, isAdmin, router]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const fetchSyncStatus = async () => {
    try {
      const [fixturesStatus, liveStatus, pollingStatus] = await Promise.all([
        fetch('/api/admin/sync-fixtures').then(r => r.json()),
        fetch('/api/admin/sync-live-scores').then(r => r.json()),
        fetch('/api/live-scores/polling').then(r => r.json())
      ]);
      
      setSyncStatus({
        fixtures: fixturesStatus,
        liveScores: liveStatus
      });
      setPollingStatus(pollingStatus);
    } catch (error) {
      addLog(`Error fetching sync status: ${error}`);
    }
  };

  const handlePollingControl = async (action: string) => {
    setLoading(true);
    addLog(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)} polling service...`);
    
    try {
      const response = await fetch(`/api/live-scores/polling?action=${action}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ ${data.result.message}`);
        if (data.result.pollResult) {
          addLog(`📊 Polling status: Active: ${data.polling.isActive}, Total polls: ${data.polling.totalPolls}, Errors: ${data.polling.errors}`);
        }
      } else {
        addLog(`❌ Polling control failed: ${data.error}`);
      }
      
      // Refresh status
      await fetchSyncStatus();
      await refreshLiveScores();
    } catch (error) {
      addLog(`❌ Error controlling polling: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLiveScoresSync = async () => {
    setLoading(true);
    addLog('🔄 Manual live scores sync...');
    
    try {
      const response = await fetch('/api/live-scores', { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ Manual sync completed: ${data.updates.count} updates`);
        if (data.liveWindow.isLive) {
          addLog(`⚽ Live matches: ${data.liveWindow.matchesCount}`);
        } else {
          addLog(`ℹ️ No live matches currently`);
        }
        if (data.apiCall.made) {
          addLog(`📡 API call made at ${new Date(data.apiCall.timestamp).toLocaleTimeString()}`);
        }
      } else {
        addLog(`❌ Manual sync failed: ${data.error}`);
      }
      
      await refreshLiveScores();
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error in manual sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTeams = async () => {
    setLoading(true);
    addLog('👥 Starting teams sync...');
    
    try {
      const response = await fetch('/api/admin/sync-teams', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Teams sync completed: ${data.stats?.teamsCreated} teams created`);
        addLog(`📊 API calls used: ${data.apiCalls}/100`);
      } else {
        addLog(`❌ Teams sync failed: ${data.error || data.message}`);
        if (data.existingTeams) {
          addLog(`💡 Found ${data.existingTeams} existing teams. Use "Clear All Data" first if you need to resync.`);
        }
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during teams sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFixtures = async () => {
    setLoading(true);
    addLog('🔄 Starting fixtures sync...');
    
    try {
      const response = await fetch('/api/admin/sync-fixtures', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Fixtures sync completed: ${data.stats?.fixturesNew} new, ${data.stats?.fixturesUpdated} updated`);
        addLog(`📊 API calls used: ${data.apiCalls}/100`);
      } else {
        addLog(`❌ Fixtures sync failed: ${data.error}`);
        if (data.error?.includes('sync teams first')) {
          addLog(`💡 Hint: Click "Sync Teams" button first to set up teams`);
        }
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during fixtures sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLiveScores = async () => {
    setLoading(true);
    addLog('⚽ Starting live scores sync...');
    
    try {
      const response = await fetch('/api/admin/sync-live-scores', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Live scores sync completed: ${data.stats?.fixturesUpdated} updated`);
        addLog(`📊 Total API calls: ${data.totalApiCalls}/100`);
      } else {
        addLog(`❌ Live scores sync failed: ${data.error}`);
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during live scores sync: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScores = async () => {
    setLoading(true);
    addLog('🎯 Starting score calculations...');
    
    try {
      const response = await fetch('/api/admin/calculate-scores', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Score calculation completed: ${data.stats?.totalScores} predictions scored`);
      } else {
        addLog(`❌ Score calculation failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error during score calculation: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('⚠️ Are you sure? This will delete ALL teams, fixtures, and predictions. This action cannot be undone!')) {
      return;
    }
    
    setLoading(true);
    addLog('🗑️ Starting database cleanup...');
    
    try {
      const response = await fetch('/api/admin/clear-data', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Database cleared: ${data.stats?.teamsDeleted} teams, ${data.stats?.fixturesDeleted} fixtures, ${data.stats?.predictionsDeleted} predictions deleted`);
        addLog('💡 You can now sync teams and fixtures again');
      } else {
        addLog(`❌ Clear data failed: ${data.error}`);
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during database cleanup: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPredictions = async () => {
    if (!confirm('⚠️ Are you sure? This will delete ALL user predictions. This action cannot be undone!')) {
      return;
    }
    
    setLoading(true);
    addLog('🗑️ Starting predictions cleanup...');
    
    try {
      const response = await fetch('/api/admin/clear-predictions', {
        method: 'POST'
      });
      
      const data: SyncResponse = await response.json();
      
      if (data.success) {
        addLog(`✅ Predictions cleared: ${data.stats?.predictionsDeleted} predictions deleted`);
        addLog('🧹 Clearing local storage...');
        clearAllData();
        addLog('💡 All user predictions have been removed from database and local storage');
      } else {
        addLog(`❌ Clear predictions failed: ${data.error}`);
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during predictions cleanup: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPoints = async () => {
    setLoading(true);
    addLog('🧪 Testing points calculation system...');
    
    try {
      const response = await fetch('/api/test/points');
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ Points test completed: ${data.summary.passed}/${data.summary.total} tests passed (${data.summary.passRate})`);
        
        // Log test results
        data.testResults.forEach((test: any) => {
          const emoji = test.passed ? '✅' : '❌';
          addLog(`${emoji} ${test.name}: Predicted ${test.predictionText}, Actual ${test.actualText} → ${test.actualPoints} points (${test.description})`);
        });
        
        if (data.summary.failed > 0) {
          addLog(`⚠️ ${data.summary.failed} tests failed - check implementation`);
        } else {
          addLog('🎉 All points calculation tests passed!');
        }
      } else {
        addLog(`❌ Points test failed: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error during points test: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetUserStats = async () => {
    if (!confirm('⚠️ Are you sure? This will reset ALL user statistics (points, rankings, accuracy) to 0. This action cannot be undone!')) {
      return;
    }
    
    setLoading(true);
    addLog('📊 Resetting all user statistics...');
    
    try {
      const response = await fetch('/api/admin/reset-user-stats', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ User statistics reset: ${data.stats.usersReset} users, ${data.stats.predictionsReset} prediction points cleared`);
        addLog('📋 Current users after reset:');
        data.users.forEach((user: any) => {
          addLog(`  - ${user.email} (${user.displayName}): ${user.totalPoints} points, ${user.totalPredictions} predictions`);
        });
        addLog('💡 All users now have 0 points and fresh statistics');
      } else {
        addLog(`❌ Reset failed: ${data.error}`);
      }
      
      await fetchSyncStatus();
    } catch (error) {
      addLog(`❌ Error during user stats reset: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage fixtures sync, live scores, and data operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Admin Panel</div>
                <div className="text-xs text-gray-400">System Administrator</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-100 shadow-sm">
                  ⚙️
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Admin</div>
                  <div className="text-xs text-gray-500 truncate max-w-32">{session.user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900">Fixtures</h3>
                <div className="text-sm text-blue-700 mt-1">
                  <div>Total: {syncStatus.fixtures?.fixtureCount || 0} fixtures</div>
                  <div>Teams: {syncStatus.fixtures?.teamCount || 0}</div>
                  <div>API Calls: {syncStatus.fixtures?.apiCallsToday || 0}/100</div>
                  <div>Last Sync: {syncStatus.fixtures?.lastSync ? new Date(syncStatus.fixtures.lastSync).toLocaleString() : 'Never'}</div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900">Live Scores</h3>
                <div className="text-sm text-green-700 mt-1">
                  <div>Live Matches: {syncStatus.liveScores?.currentlyLive?.length || 0}</div>
                  <div>Recent Finished: {syncStatus.liveScores?.recentlyFinished?.length || 0}</div>
                  <div>Total API Calls: {syncStatus.liveScores?.totalApiCalls || 0}/100</div>
                  <div>Last Sync: {syncStatus.liveScores?.lastSync ? new Date(syncStatus.liveScores.lastSync).toLocaleString() : 'Never'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Operations</h2>
          
          {/* First-time Setup */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">🚀 First-time Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSyncTeams}
                disabled={loading}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">👥 Sync Teams</div>
                <div className="text-sm opacity-90 mt-1">
                  One-time setup: Extract teams from 2025-26 fixtures
                </div>
              </button>

              <button
                onClick={handleSyncFixtures}
                disabled={loading}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">🔄 Sync Fixtures</div>
                <div className="text-sm opacity-90 mt-1">
                  Fetch all 2025-26 Premier League fixtures from API
                </div>
              </button>
            </div>
          </div>

          {/* Regular Operations */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">⚙️ Regular Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={handleSyncLiveScores}
                disabled={loading}
                className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">⚽ Sync Live Scores</div>
                <div className="text-sm opacity-90 mt-1">
                  Update scores for live/recent matches
                </div>
              </button>

              <button
                onClick={handleCalculateScores}
                disabled={loading}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">🎯 Calculate Scores</div>
                <div className="text-sm opacity-90 mt-1">
                  Calculate points for finished matches
                </div>
              </button>

              <button
                onClick={handleTestPoints}
                disabled={loading}
                className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">🧪 Test Points</div>
                <div className="text-sm opacity-90 mt-1">
                  Test points calculation system
                </div>
              </button>

              <button
                onClick={handleResetUserStats}
                disabled={loading}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-lg font-medium">📊 Reset User Stats</div>
                <div className="text-sm opacity-90 mt-1">
                  Reset all user points and rankings to 0
                </div>
              </button>
            </div>
          </div>

          {/* Live Scores Polling Management */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">🔄 Live Scores Polling (Auto-Refresh)</h3>
            
            {/* Polling Status Display */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              {pollingStatus === null ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <div className="text-sm text-gray-500 mt-2">Loading polling status...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Polling Status</div>
                    <div className={`text-lg font-bold ${pollingActive ? 'text-green-600' : 'text-gray-400'}`}>
                      {pollingActive ? '🟢 Active' : '⚪ Inactive'}
                    </div>
                    {pollingStatus?.polling && (
                      <div className="text-xs text-gray-500 mt-1">
                        Total polls: {pollingStatus.polling.totalPolls || 0}, Errors: {pollingStatus.polling.errors || 0}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Live Matches</div>
                    <div className={`text-lg font-bold ${hasLiveMatches ? 'text-red-600' : 'text-gray-400'}`}>
                      {liveWindow?.isLive ? `🔴 ${liveWindow.matchesCount} Live` : '⚫ None'}
                    </div>
                    {liveWindow?.allMatchesFinished && (
                      <div className="text-xs text-green-600 mt-1">All matches finished</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Last Update</div>
                    <div className="text-lg font-bold text-blue-600">
                      {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                    </div>
                    {pollingStatus?.polling?.nextPoll && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {new Date(pollingStatus.polling.nextPoll).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Polling Control Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handlePollingControl('smart-start')}
                disabled={loading}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">🤖 Smart Start</div>
                <div className="text-xs opacity-90 mt-1">Auto start if needed</div>
              </button>

              <button
                onClick={() => handlePollingControl('start')}
                disabled={loading || pollingActive}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">▶️ Force Start</div>
                <div className="text-xs opacity-90 mt-1">Start manually</div>
              </button>

              <button
                onClick={() => handlePollingControl('stop')}
                disabled={loading || !pollingActive}
                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">⏹️ Stop</div>
                <div className="text-xs opacity-90 mt-1">Stop polling</div>
              </button>

              <button
                onClick={() => handlePollingControl('force-poll')}
                disabled={loading}
                className="p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">🔄 Force Poll</div>
                <div className="text-xs opacity-90 mt-1">Manual poll now</div>
              </button>
            </div>

            {/* Manual Live Scores Sync */}
            <div className="mt-4">
              <button
                onClick={handleManualLiveScoresSync}
                disabled={loading}
                className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">📡 Manual Live Scores Sync</div>
                <div className="text-xs opacity-90 mt-1">One-time API call to update live scores</div>
              </button>
            </div>

            {/* Recommendation */}
            {pollingStatus?.recommendation?.action && pollingStatus.recommendation.action !== 'none' && (
              <div className={`mt-4 p-3 rounded-lg ${
                pollingStatus.recommendation.action === 'start' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}>
                <div className="font-medium">💡 Recommendation</div>
                <div className="text-sm mt-1">
                  {pollingStatus.recommendation.action === 'start' 
                    ? 'Live matches detected. Consider starting polling service.'
                    : 'No live matches. Consider stopping polling to save resources.'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="border-t border-red-200 pt-6 mt-6">
            <h3 className="text-md font-medium text-red-700 mb-3">⚠️ Danger Zone</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleClearPredictions}
                disabled={loading}
                className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-700"
              >
                <div className="text-lg font-medium">🎯 Clear Predictions</div>
                <div className="text-sm opacity-90 mt-1">
                  Delete all user predictions only
                </div>
              </button>
              
              <button
                onClick={handleClearData}
                disabled={loading}
                className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-700"
              >
                <div className="text-lg font-medium">🗑️ Clear All Data</div>
                <div className="text-sm opacity-90 mt-1">
                  Delete all teams, fixtures, and predictions (irreversible!)
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Activity Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No activity logs yet. Click a button above to start operations.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}