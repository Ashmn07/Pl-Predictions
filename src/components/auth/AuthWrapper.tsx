'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignIn from '@/app/auth/signin/page';
import SignUp from '@/app/auth/signup/page';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [debugInfo, setDebugInfo] = useState('');

  // Debug: Log session status changes
  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);
    setDebugInfo(`Status: ${status}, Session: ${session ? 'exists' : 'null'}`);
  }, [status, session]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
          <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the full app
  if (session) {
    console.log('User authenticated, showing app');
    return <>{children}</>;
  }

  // If user is not authenticated, show login/signup
  console.log('User not authenticated, showing auth forms');
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50">
      {/* Debug Info */}
      <div className="fixed top-4 right-4 bg-white p-2 rounded shadow text-xs">
        {debugInfo}
      </div>

      {/* Header with app branding */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ⚽ Premier League Predictions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test your Premier League knowledge, compete with friends, and climb the leaderboard with your prediction skills!
          </p>
        </div>

        {/* Auth Toggle */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'signin'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                authMode === 'signup'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          {authMode === 'signin' ? (
            <AuthFormWrapper>
              <SignIn />
            </AuthFormWrapper>
          ) : (
            <AuthFormWrapper>
              <SignUp />
            </AuthFormWrapper>
          )}
        </div>

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What awaits you inside
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Make Predictions"
              description="Predict match outcomes with confidence levels and earn points for accuracy"
            />
            <FeatureCard
              icon="🏆"
              title="Compete & Rank"
              description="Climb the leaderboard and unlock achievements as you improve your skills"
            />
            <FeatureCard
              icon="👥"
              title="Social Features"
              description="Create private leagues, add friends, and compete in custom competitions"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>Join thousands of Premier League fans testing their prediction skills!</p>
        </div>
      </div>
    </div>
  );
};

// Wrapper to remove the background from auth form components
const AuthFormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <div className="[&>*]:!bg-transparent [&>*]:!shadow-none [&>*]:!border-none [&>*]:!rounded-none">
        {children}
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default AuthWrapper;