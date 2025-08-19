'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';

interface SimpleAuthWrapperProps {
  children: React.ReactNode;
}

const SimpleAuthWrapper: React.FC<SimpleAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();

  // If authenticated, show the app
  if (session) {
    return <>{children}</>;
  }

  // If not authenticated, show login/signup
  return <AuthScreen />;
};

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { showToast } = useToast();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-4">
            ⚽ Premier League Predictions
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => {
                console.log('Sign In clicked');
                setIsSignUp(false);
              }}
              className={`flex-1 py-2 px-4 text-center rounded-l-lg transition-colors ${
                !isSignUp ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Sign Up clicked');
                setIsSignUp(true);
              }}
              className={`flex-1 py-2 px-4 text-center rounded-r-lg transition-colors ${
                isSignUp ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignUp ? (
            <SignUpForm showToast={showToast} />
          ) : (
            <SignInForm showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
};

interface SignInFormProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ showToast }) => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        showToast('Invalid email or password. Please try again.', 'error');
      } else if (result?.ok) {
        showToast('Successfully signed in! Welcome back.', 'success');
        // The useSession hook will automatically detect the new session and re-render
      }
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

interface SignUpFormProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.email.split('@')[0],
          displayName: formData.name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create account');
      }

      showToast('Account created successfully! Signing you in...', 'success');
      
      // Auto sign-in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        showToast('Account created but sign-in failed. Please try signing in manually.', 'error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          required
          minLength={6}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SimpleAuthWrapper;