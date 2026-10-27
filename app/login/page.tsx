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

    // Check if Admin
    const { data: adminData } = await supabase.from('admins').select('id').eq('id', authData.user.id).maybeSingle();
    if (adminData) { router.push('/admin'); return; }

    // Check if Contestant
    const { data: contestantData } = await supabase.from('contestants').select('id').eq('email', email.trim()).maybeSingle();
    if (contestantData) { router.push('/contestant/dashboard'); return; }

    // No profile found
    await supabase.auth.signOut();
    setError('Account authenticated, but no profile found. Please register.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-6">
          <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-3">GB</div>
          <h1 className="text-xl font-black text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-xs mt-1">Sign in to continue</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-2.5 rounded-lg mb-4 text-xs font-semibold text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:border-black text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:border-black text-sm" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 text-sm">
            {loading ? 'Checking...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          New contestant? <Link href="/register" className="font-bold text-black underline">Apply here</Link>
        </div>
      </div>
    </div>
  );
}
