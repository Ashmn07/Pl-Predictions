'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { MenuIcon, ChevronDownIcon, UserIcon } from '@/components/ui/icons';
import { usePredictions } from '@/contexts/PredictionContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userStats } = usePredictions();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getUserFirstLetter = () => {
    if (!session?.user?.name) return 'U';
    return session.user.name.charAt(0).toUpperCase();
  };

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Open main menu"
        >
          <MenuIcon size={24} />
        </button>

        {/* Logo and title */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                PL Predictions
              </h1>
              <p className="text-sm text-gray-500">Premier League Predictor</p>
            </div>
          </Link>
        </div>

        {/* Right side - Stats and User menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User Stats - Compact cards */}
          <div className="hidden xl:flex items-center space-x-3">
            <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 font-medium">Points</div>
              <div className="text-sm font-bold text-green-700">{userStats.totalPoints}</div>
            </div>
            <div className="bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
              <div className="text-xs text-purple-600 font-medium">Rank</div>
              <div className="text-sm font-bold text-purple-700">#{userStats.currentRank || '-'}</div>
            </div>
          </div>

          {/* Tablet stats - simplified */}
          <div className="hidden lg:flex xl:hidden items-center space-x-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              <span className="font-semibold text-green-600">{userStats.totalPoints}</span> pts
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
              <span className="font-semibold text-purple-600">#{userStats.currentRank || '-'}</span>
            </div>
          </div>

          {/* Mobile - stats hidden to prevent overlap */}
          
          {/* Custom Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-100 shadow-sm">
                {getUserFirstLetter()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  Online
                </div>
              </div>
              <ChevronDownIcon 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isMenuOpen && (
              <>
                {/* Overlay */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {getUserFirstLetter()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {session?.user?.name || 'User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {session?.user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      Your Profile
                    </Link>
                    
                    <Link
                      href="/analytics"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Your Analytics
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>

                    <hr className="my-2" />
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;