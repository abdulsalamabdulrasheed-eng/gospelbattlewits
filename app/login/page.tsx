'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function GeneralLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    // 2. Check if Admin
    const { data: adminData } = await supabase.from('admins').select('id').eq('id', authData.user.id).maybeSingle();

    if (adminData) {
      // Check MFA status
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (mfaData?.currentLevel === 'aal1' && mfaData?.nextLevel === 'aal2') {
        // Admin needs to enter MFA code
        setShowMfa(true);
        setLoading(false);
        return;
      } else {
        // Admin logged in (MFA not required or not set up)
        router.push('/admin');
        return;
      }
    }

    // 3. Check if Contestant
    const { data: contestantData } = await supabase.from('contestants').select('id').eq('email', email.trim()).maybeSingle();
    if (contestantData) {
      router.push('/contestant/dashboard');
      return;
    }

    // Not an admin or contestant
    await supabase.auth.signOut();
    setError('Account authenticated, but no profile found. Please register.');
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
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-6">
          <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-3">GB</div>
          <h1 className="text-xl font-black text-gray-900">
            {showMfa ? 'Two-Factor Auth' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            {showMfa ? 'Enter the code from your authenticator app' : 'Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-2.5 rounded-lg mb-4 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {!showMfa ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:border-black text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full p-2.5 pr-10 border rounded-lg outline-none focus:border-black text-sm" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 text-sm">
              {loading ? 'Checking...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyMfa} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">6-Digit Code</label>
              <input type="text" maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="w-full p-3 border rounded-lg text-center text-xl tracking-widest outline-none focus:border-black" placeholder="000000" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 text-sm">
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-gray-500">
          New contestant? <Link href="/register" className="font-bold text-black underline">Apply here</Link>
        </div>
      </div>
    </div>
  );
}
