'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

interface DebugAuthWrapperProps {
  children: React.ReactNode;
}

const DebugAuthWrapper: React.FC<DebugAuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession();
  
  console.log('🔍 Debug Auth State:', {
    status,
    sessionExists: !!session,
    sessionData: session,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Debug Panel */}
      <div className="bg-black text-green-400 p-4 font-mono text-sm">
        <div>Status: {status}</div>
        <div>Session: {session ? 'EXISTS' : 'NULL'}</div>
        <div>User: {session?.user?.email || 'None'}</div>
        <div>Timestamp: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading session...</p>
          </div>
        )}

        {status === 'authenticated' && session && (
          <div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">✅ AUTHENTICATED</h1>
            <p>Welcome, {session.user?.email}!</p>
            <div className="mt-8">
              {children}
            </div>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ NOT AUTHENTICATED</h1>
            <p>Please sign in to continue.</p>
            <div className="mt-4">
              <SimpleSignInForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SimpleSignInForm: React.FC = () => {
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('demo123');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { signIn } = await import('next-auth/react');
      console.log('🔐 Attempting sign in...', { email });
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('🔐 Sign in result:', result);

      if (result?.error) {
        alert('Sign in failed: ' + result.error);
      } else if (result?.ok) {
        console.log('✅ Sign in successful');
        window.location.reload();
      }
    } catch (err) {
      console.error('❌ Sign in error:', err);
      alert('Sign in error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
};

export default DebugAuthWrapper;