'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function Setup2FA() {
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const enroll = async () => {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setQrCode(data.totp.qr_code);
      setFactorId(data.id);
      setLoading(false);
    };
    enroll();
  }, []);

  const verify = async () => {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      setError(error.message);
    } else {
      router.push('/admin');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading 2FA Setup...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border text-center">
        <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Secure Your Account</h1>
        <p className="text-sm text-gray-500 mb-6">Scan this QR code with Google Authenticator or Authy.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}

        {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto mb-6 w-48 h-48 border-4 border-white shadow-lg rounded-xl" />}

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 border rounded-lg text-center text-xl tracking-widest mb-4 outline-none focus:border-black"
          maxLength={6}
        />
        <button onClick={verify} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">Verify & Enable 2FA</button>
      </div>
    </div>
  );
}
