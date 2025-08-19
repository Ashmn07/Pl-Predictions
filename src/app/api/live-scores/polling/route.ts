import { NextRequest, NextResponse } from 'next/server';
import { backgroundPollingControls } from '@/lib/server/live-scores-background';

/**
 * GET /api/live-scores/polling
 * Get current polling status
 */
export async function GET() {
  try {
    const status = backgroundPollingControls.status();
    const shouldBeActive = await backgroundPollingControls.smartStart(); // This will check if should be active
    
    return NextResponse.json({
      success: true,
      polling: status,
      recommendation: {
        shouldBeActive: status.isActive,
        action: status.isActive ? 'running' : 'start'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting polling status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get polling status'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live-scores/polling
 * Control polling service (start/stop/smart-start/force-poll)
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
        result = { message: 'Background polling started manually' };
        break;
        
      case 'stop':
        backgroundPollingControls.stop();
        result = { message: 'Background polling stopped manually' };
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
      polling: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error controlling polling service:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to control polling service'
      },
      { status: 500 }
    );
  }
}