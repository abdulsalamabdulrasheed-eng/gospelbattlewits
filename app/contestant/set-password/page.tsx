'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/contestant/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border text-center">
        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">✓</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Secure Your Account</h1>
        <p className="text-gray-500 text-sm mb-6">Please set a password so you can log in from other devices.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleSet} className="space-y-4 text-left">
          <div><label className="block text-sm font-bold text-gray-700 mb-1">New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:border-black" required /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:border-black" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">{loading ? 'Saving...' : 'Set Password & Continue'}</button>
        </form>
      </div>
    </div>
  );
}
