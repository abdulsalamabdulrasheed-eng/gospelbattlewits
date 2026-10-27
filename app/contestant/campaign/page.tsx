'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { Download, Share2, Copy, CheckCircle2, Lock } from 'lucide-react';

export default function CampaignPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isVerified = profile?.email_verified === true && profile?.phone_verified === true;
  const isApproved = profile?.status === 'approved';
  const isFullyReady = isVerified && isApproved;

  const votingLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${profile?.contestant_id}`;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('contestants').select('*').eq('email', user.email).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(votingLink);
    alert("Link copied!");
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Vote for me in TFTC Live Show 2027! 🏆\n\nClick my link to support me: ${votingLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const downloadFlyer = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `TFTC_${profile.contestant_id}_Flyer.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to generate flyer.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-6 text-sm font-bold text-gray-500">Loading...</div>;

  if (!isFullyReady) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4"><Lock size={32} className="text-gray-400"/></div>
        <h1 className="text-xl font-black text-gray-900 mb-2">Campaign Tools Locked</h1>
        <p className="text-sm text-gray-500 max-w-sm mb-4">You must be approved and verified to access your flyer and share tools.</p>
        <a href="/contestant/dashboard" className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">Go to Verification</a>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">My Campaign</h1>
        <p className="text-xs text-gray-500 mt-1">Download your flyer and rally your supporters.</p>
      </div>

      {/* FLYER PREVIEW */}
      <div className="flex justify-center">
        <div 
          ref={flyerRef} 
          className="w-full max-w-[340px] bg-black text-white rounded-3xl overflow-hidden shadow-2xl relative border-[6px] border-yellow-500"
        >
          <div className="p-6 text-center">
            <div className="text-[10px] font-black text-yellow-500 tracking-[0.3em] uppercase mb-4">Gospel Battle Wits</div>
            <div className="text-3xl font-black leading-tight mb-1">TFTC</div>
            <div className="text-xs font-bold text-gray-400 tracking-widest mb-6">LIVE SHOW 2027</div>
            
            <img src={profile.photo_url} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-yellow-500 shadow-lg mb-4" />
            
            <h2 className="text-2xl font-black text-white">{profile.stage_name || profile.full_name}</h2>
            <p className="text-xs text-gray-400 mb-1">{profile.church}</p>
            <p className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 inline-block px-3 py-1 rounded-full border border-yellow-500/20">{profile.contestant_id}</p>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vote for me at:</p>
              <p className="text-xs font-bold text-white break-all">{votingLink}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-lg mx-auto">
        <button onClick={downloadFlyer} disabled={downloading} className="bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50">
          {downloading ? 'Generating...' : <><Download size={16}/> Download Flyer</>}
        </button>
        <button onClick={handleWhatsApp} className="bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Share2 size={16}/> Share to WhatsApp
        </button>
        <button onClick={handleCopy} className="bg-white border-2 border-black text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Copy size={16}/> Copy Link
        </button>
      </div>

      {/* TIPS */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto">
        <h3 className="text-xs font-bold text-blue-900 mb-2">💡 Campaign Tips</h3>
        <ul className="text-[11px] text-blue-800 space-y-1 list-disc pl-4">
          <li>Post this flyer on your WhatsApp status every morning.</li>
          <li>Ask your church to vote during service.</li>
          <li>Create a WhatsApp group for your supporters.</li>
        </ul>
      </div>
    </div>
  );
}
