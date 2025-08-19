import { NextRequest, NextResponse } from 'next/server';
import { apiFootball, PREMIER_LEAGUE_ID } from '@/lib/football-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'seasons';
    
    if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'your-rapidapi-key-here') {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 });
    }

    let debugInfo: any = {};
    
    if (action === 'seasons') {
      // Get available seasons for Premier League
      debugInfo.seasons = await apiFootball.makeRequest(`/leagues/seasons`);
    } else if (action === 'league') {
      // Get Premier League info for different seasons
      debugInfo.league2024 = await apiFootball.makeRequest(`/leagues?id=${PREMIER_LEAGUE_ID}&season=2024`);
      debugInfo.league2025 = await apiFootball.makeRequest(`/leagues?id=${PREMIER_LEAGUE_ID}&season=2025`);
    } else if (action === 'upcoming') {
      // Check different ways to get upcoming fixtures
      debugInfo.today = new Date().toISOString().split('T')[0];
      debugInfo.nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Try different approaches
      try {
        debugInfo.next2024 = await apiFootball.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=2024&next=5`);
      } catch (e) {
        debugInfo.next2024Error = e instanceof Error ? e.message : 'Unknown error';
      }
      
      try {
        debugInfo.next2025 = await apiFootball.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=2025&next=5`);
      } catch (e) {
        debugInfo.next2025Error = e instanceof Error ? e.message : 'Unknown error';
      }
      
      try {
        debugInfo.fromToday = await apiFootball.makeRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&from=${debugInfo.today}&to=${debugInfo.nextWeek}`);
      } catch (e) {
        debugInfo.fromTodayError = e instanceof Error ? e.message : 'Unknown error';
      }
    }
    
    return NextResponse.json({
      success: true,
      action,
      debugInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Debug request failed'
      },
      { status: 500 }
    );
  }
}