'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add a 10-second timeout to prevent infinite hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Please check your internet connection or Supabase keys.')), 10000)
      );

      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      const { error } = await Promise.race([loginPromise, timeout]) as any;

      if (error) {
        setError(error.message);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-4">GB</div>
          <h1 className="text-2xl font-black text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-2">Gospel Battle Wits — God Mode</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              placeholder="admin@gospelbattlewits.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Authenticating...
              </>
            ) : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
