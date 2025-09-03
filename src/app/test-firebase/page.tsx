'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function TestFirebasePage() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test Firebase connection
    try {
      setStatus('Firebase initialized successfully');
      console.log('Auth object:', auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Firebase initialization failed');
    }
  }, []);

  const testGoogleSignIn = async () => {
    try {
      setStatus('Attempting Google sign in...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setStatus(`Google sign in successful: ${result.user.email}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('Google sign in failed');
      console.error('Google sign in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Status:</h2>
          <p className="text-sm text-gray-600">{status}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error:</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={testGoogleSignIn}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Test Google Sign In
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
}

