'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function Setup2FA() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const enroll = async () => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) {
        setError(error.message);
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    };
    enroll();
  }, []);

  const verify = async () => {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (error) {
      setError(error.message);
    } else {
      alert('2FA Enabled Successfully!');
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border text-center">
        <h1 className="text-2xl font-black mb-4">Secure Your Admin Account</h1>
        <p className="text-sm text-gray-500 mb-6">Scan this QR code with Google Authenticator or Authy.</p>
        
        {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto mb-6 w-48 h-48" />}
        {secret && <p className="text-xs font-mono bg-gray-100 p-2 rounded mb-6">Manual Code: {secret}</p>}

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 border rounded-lg text-center text-xl tracking-widest mb-4"
          maxLength={6}
        />
        <button onClick={verify} className="w-full bg-black text-white font-bold py-3 rounded-lg">Verify & Enable</button>
      </div>
    </div>
  );
}
