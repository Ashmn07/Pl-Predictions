import { NextRequest, NextResponse } from 'next/server';
import { apiFootball } from '@/lib/football-api';
import { mockPremierLeagueTeams } from '@/lib/football-api-fallback';

export async function GET(request: NextRequest) {
  try {
    console.log('🏈 Fetching Premier League teams...');
    
    // Check if API key is available
    if (!process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY === 'your-rapidapi-key-here') {
      console.log('📋 Using fallback mock data (no API key configured)');
      return NextResponse.json({
        success: true,
        count: mockPremierLeagueTeams.length,
        teams: mockPremierLeagueTeams,
        source: 'mock'
      });
    }
    
    const data = await apiFootball.getPremierLeagueTeams();
    
    return NextResponse.json({
      success: true,
      count: data.response.length,
      teams: data.response,
      source: 'api'
    });
  } catch (error) {
    console.error('❌ Error fetching teams, falling back to mock data:', error);
    
    // Fallback to mock data if API fails
    return NextResponse.json({
      success: true,
      count: mockPremierLeagueTeams.length,
      teams: mockPremierLeagueTeams,
      source: 'fallback',
      originalError: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}