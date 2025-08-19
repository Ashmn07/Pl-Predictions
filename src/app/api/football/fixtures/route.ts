import { NextRequest, NextResponse } from 'next/server';
import { apiFootball } from '@/lib/football-api';
import { mockPremierLeagueFixtures } from '@/lib/football-api-fallback';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get('round');
    const next = searchParams.get('next');
    
    console.log('🏈 Fetching Premier League fixtures...', { round, next });
    
    // Check if API key is available
    if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'your-rapidapi-key-here') {
      console.log('📋 Using fallback mock fixture data (no API key configured)');
      return NextResponse.json({
        success: true,
        count: mockPremierLeagueFixtures.length,
        fixtures: mockPremierLeagueFixtures,
        source: 'mock'
      });
    }
    
    let data;
    
    if (next === 'true') {
      // Use the smart upcoming fixtures method
      data = await apiFootball.getUpcomingFixtures(10);
    } else if (round) {
      data = await apiFootball.getPremierLeagueFixtures(parseInt(round));
    } else {
      data = await apiFootball.getPremierLeagueFixtures();
    }
    
    return NextResponse.json({
      success: true,
      count: data.response.length,
      fixtures: data.response,
      source: 'api'
    });
  } catch (error) {
    console.error('❌ Error fetching fixtures, falling back to mock data:', error);
    
    // Fallback to mock data if API fails
    return NextResponse.json({
      success: true,
      count: mockPremierLeagueFixtures.length,
      fixtures: mockPremierLeagueFixtures,
      source: 'fallback',
      originalError: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}