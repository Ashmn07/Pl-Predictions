'use client';

import React, { useState, useEffect } from 'react';
import QuickStats from '@/components/dashboard/QuickStats';
import { usePredictions } from '@/contexts/PredictionContext';
import TopPerformers from '@/components/leaderboard/TopPerformers';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { userStats, isLoading } = usePredictions();
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!session?.user?.email) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch('/api/leaderboard?limit=100');
        const users = await response.json();
        
        if (Array.isArray(users)) {
          const user = users.find(u => u.username === session.user?.email?.split('@')[0]);
          setCurrentUser(user || null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your Premier League prediction dashboard
        </p>
      </div>

      {/* Quick stats cards */}
      <QuickStats 
        totalPoints={userStats.totalPoints}
        currentRank={userStats.currentRank}
        predictionsMade={userStats.predictionsMade}
        accuracyRate={userStats.accuracyRate}
      />

      {/* Quick Action Card */}
      <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to make predictions?
            </h3>
            <p className="text-gray-600">
              Gameweek 1 fixtures are now available. Make your predictions and start earning points!
            </p>
          </div>
          <Link 
            href="/fixtures"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-purple-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-purple-700 transition-colors duration-200 flex-shrink-0"
          >
            View Fixtures
          </Link>
        </div>
      </div>

      {/* Top Performers */}
      <TopPerformers />

      {/* Your Position */}
      {currentUser && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900">Your Position</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👤</div>
              <div className="text-2xl font-bold text-green-600">#{currentUser.currentRank || currentUser.rank}</div>
              <div className="text-gray-600 mb-4">Current Season Rank</div>
              
              {currentUser.rankChange !== 0 && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  currentUser.rankChange > 0
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentUser.rankChange > 0
                    ? `↗️ Up ${currentUser.rankChange} places` 
                    : `↘️ Down ${Math.abs(currentUser.rankChange)} places`
                  }
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{currentUser.currentStreak || 0}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{Math.round(currentUser.accuracyRate || 0)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
            
            <Link
              href="/profile"
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Full Profile
            </Link>
          </div>
        </div>
      )}

      {loadingUser && !currentUser && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading your stats...</p>
          </div>
        </div>
      )}
    </div>
  );
}