'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          message: 'There is a problem with the server configuration. Please try again later.',
          icon: '⚙️'
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in. Please contact support if you believe this is an error.',
          icon: '🚫'
        };
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token has expired or has already been used. Please request a new one.',
          icon: '📧'
        };
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign In Error',
          message: 'There was an error with the OAuth provider. Please try again.',
          icon: '🔐'
        };
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          message: 'There was an error during the OAuth callback. Please try again.',
          icon: '🔄'
        };
      case 'OAuthCreateAccount':
        return {
          title: 'OAuth Account Creation Error',
          message: 'Could not create an account with the OAuth provider. Please try again.',
          icon: '👤'
        };
      case 'EmailCreateAccount':
        return {
          title: 'Email Account Creation Error',
          message: 'Could not create an account with email. Please try again.',
          icon: '📧'
        };
      case 'Callback':
        return {
          title: 'Callback Error',
          message: 'There was an error during authentication. Please try again.',
          icon: '❌'
        };
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Not Linked',
          message: 'This email is already associated with another account. Please sign in with your original method.',
          icon: '🔗'
        };
      case 'EmailSignin':
        return {
          title: 'Email Sign In Error',
          message: 'The sign in link is no longer valid. Please request a new one.',
          icon: '📧'
        };
      case 'CredentialsSignin':
        return {
          title: 'Credentials Error',
          message: 'Invalid credentials. Please check your email and password and try again.',
          icon: '🔑'
        };
      case 'SessionRequired':
        return {
          title: 'Session Required',
          message: 'You must be signed in to access this page.',
          icon: '🔒'
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication. Please try again.',
          icon: '⚠️'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md p-8 text-center">
        <div className="text-6xl mb-4">{errorInfo.icon}</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {errorInfo.title}
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {errorInfo.message}
        </p>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full bg-gradient-to-r from-green-500 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:from-green-600 hover:to-purple-700 transition-colors"
          >
            Try Sign In Again
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Error Code: <code className="font-mono">{error}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}