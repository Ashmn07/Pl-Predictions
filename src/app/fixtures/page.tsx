'use client';

import React, { useEffect, useState } from 'react';
import FixturesDisplay from '@/components/fixtures/FixturesDisplay';
import { Match } from '@/types';
import { getCurrentGameweek } from '@/lib/gameweek-utils';

export default function Fixtures() {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameweek, setGameweek] = useState(1);
  const [initialGameweekSet, setInitialGameweekSet] = useState(false);

  // First, fetch all fixtures to determine the current gameweek
  useEffect(() => {
    async function initializeGameweek() {
      if (initialGameweekSet) return;
      
      try {
        const response = await fetch(`/api/fixtures?season=2025-26`);
        const data = await response.json();
        
        if (data.success && data.fixtures) {
          const currentGW = getCurrentGameweek(data.fixtures);
          setGameweek(currentGW);
          setInitialGameweekSet(true);
        }
      } catch (err) {
        console.error('Error initializing gameweek:', err);
        setInitialGameweekSet(true); // Continue with default gameweek 1
      }
    }

    initializeGameweek();
  }, [initialGameweekSet]);

  // Then fetch fixtures for the selected gameweek
  useEffect(() => {
    if (!initialGameweekSet) return;
    
    async function fetchFixtures() {
      try {
        setLoading(true);
        const response = await fetch(`/api/fixtures?gameweek=${gameweek}&season=2025-26`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch fixtures');
        }
        
        setFixtures(data.fixtures);
      } catch (err) {
        console.error('Error fetching fixtures:', err);
        setError(err instanceof Error ? err.message : 'Failed to load fixtures');
      } finally {
        setLoading(false);
      }
    }

    fetchFixtures();
  }, [gameweek, initialGameweekSet]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fixtures</h1>
          <p className="mt-2 text-gray-600">
            Make your predictions for upcoming Premier League matches
          </p>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading fixtures...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fixtures</h1>
          <p className="mt-2 text-gray-600">
            Make your predictions for upcoming Premier League matches
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-800 font-medium mb-2">Error loading fixtures</div>
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fixtures</h1>
          <p className="mt-2 text-gray-600">
            Make your predictions for upcoming Premier League matches
          </p>
        </div>
        
        {/* Gameweek selector */}
        <div className="flex items-center space-x-3">
          <label htmlFor="gameweek" className="text-sm font-medium text-gray-700">
            Gameweek:
          </label>
          <select
            id="gameweek"
            value={gameweek}
            onChange={(e) => setGameweek(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {Array.from({ length: 38 }, (_, i) => i + 1).map(gw => (
              <option key={gw} value={gw}>
                Gameweek {gw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fixtures.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-800 font-medium mb-2">No fixtures available</div>
          <div className="text-yellow-600 text-sm">
            No fixtures found for gameweek {gameweek}. Try selecting a different gameweek or check back later.
          </div>
        </div>
      ) : (
        <FixturesDisplay fixtures={fixtures} gameweek={gameweek} />
      )}
    </div>
  );
}