'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Authenticate with Email/Password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Check if Admin (needs 2FA)
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.trim())
      .single();

    if (adminData) {
      // Check if they have MFA enabled
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (mfaData?.currentLevel === 'aal1' && mfaData?.nextLevel === 'aal2') {
        // They need to enter MFA code
        setShowMfa(true);
        setLoading(false);
        return;
      } else {
        // Admin logged in (MFA already verified or not set up yet)
        router.push('/admin');
        return;
      }
    }

    // 3. Check if Contestant
    const { data: contestantData } = await supabase
      .from('contestants')
      .select('id')
      .eq('email', email.trim())
      .single();

    if (contestantData) {
      router.push('/contestant/dashboard');
    } else {
      // Not an admin or contestant
      await supabase.auth.signOut();
      setError('No account found with this email.');
    }
    setLoading(false);
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.[0];

    if (!totpFactor) {
      setError('MFA not set up for this account.');
      setLoading(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code: mfaCode,
    });

    if (verify.error) {
      setError('Invalid code. Try again.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black mx-auto mb-4">GB</div>
          <h1 className="text-2xl font-black text-gray-900">
            {showMfa ? 'Two-Factor Auth' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {showMfa ? 'Enter the code from your authenticator app' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center border border-red-200">
            {error}
          </div>
        )}

        {!showMfa ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">6-Digit Code</label>
              <input type="text" maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-center text-2xl tracking-widest" placeholder="000000" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Not registered? <Link href="/register" className="font-bold text-black underline">Apply to Compete</Link>
        </div>
      </div>
    </div>
  );
}
