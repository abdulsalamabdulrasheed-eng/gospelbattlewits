'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GeneralLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // DEBUG: Show what email actually logged in
    const loggedInEmail = authData.user?.email;
    alert("Successfully Authenticated as: " + loggedInEmail);

    // Check if Admin (using the authenticated email, not the typed one)
    const { data: adminData, error: adminError } = await supabase.from('admins').select('id').eq('email', loggedInEmail).single();

    if (adminError) {
      alert("Admin lookup failed: " + adminError.message + ". We will check if this is a contestant.");
    }

    if (adminData) {
      router.push('/admin');
      return;
    }

    // Check if Contestant
    const { data: contestantData } = await supabase.from('contestants').select('id').eq('email', loggedInEmail).single();
    
    if (contestantData) {
      router.push('/contestant/dashboard');
    } else {
      await supabase.auth.signOut();
      setError('Account authenticated, but no profile found in admins or contestants.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-4">GB</div>
          <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:border-black" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:border-black" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          New contestant? <Link href="/register" className="font-bold text-black underline">Apply here</Link>
        </div>
      </div>
    </div>
  );
}
