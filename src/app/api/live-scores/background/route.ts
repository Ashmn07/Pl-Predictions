/**
 * Background live scores service initialization endpoint
 * Used to start/stop the background polling service
 */

import { NextRequest, NextResponse } from 'next/server';
import { backgroundPollingControls, initializeBackgroundLiveScores } from '@/lib/server/live-scores-background';

/**
 * GET /api/live-scores/background
 * Get background polling service status
 */
export async function GET() {
  try {
    const status = backgroundPollingControls.status();
    
    return NextResponse.json({
      success: true,
      backgroundService: {
        status,
        description: 'Server-side background polling for live scores',
        pollInterval: '15 minutes',
        apiCallsSource: 'backend-only'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting background service status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get background service status'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live-scores/background
 * Control background polling service
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action parameter required' },
        { status: 400 }
      );
    }

    let result: any = {};
    
    switch (action) {
      case 'start':
        await backgroundPollingControls.start();
        result = { message: 'Background polling started' };
        break;
        
      case 'stop':
        backgroundPollingControls.stop();
        result = { message: 'Background polling stopped' };
        break;
        
      case 'smart-start':
        await backgroundPollingControls.smartStart();
        result = { message: 'Background smart start completed' };
        break;
        
      case 'force-poll':
        const pollResult = await backgroundPollingControls.forcePoll();
        result = { message: 'Background manual poll completed', pollResult };
        break;
        
      case 'restart':
        backgroundPollingControls.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await backgroundPollingControls.smartStart();
        result = { message: 'Background polling restarted' };
        break;

      case 'initialize':
        await initializeBackgroundLiveScores();
        result = { message: 'Background service initialized' };
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Get updated status
    const status = backgroundPollingControls.status();
    
    return NextResponse.json({
      success: true,
      action,
      result,
      backgroundService: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error controlling background service:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to control background service'
      },
      { status: 500 }
    );
  }
}