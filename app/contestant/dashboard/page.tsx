'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, Edit2, CheckCircle2, Lock, X, Copy, Clock } from 'lucide-react';
import { useModal } from '@/utils/useModal';

export default function ContestantOverview() {
  const [profile, setProfile] = useState<any>(null);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { modal, showModal, hideModal } = useModal();
  
  const [showTour, setShowTour] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCode, setSmsCode] = useState('');

  const isPending = profile?.status === 'pending';
  const isApproved = profile?.status === 'approved';
  const isVerified = profile?.email_verified === true && profile?.phone_verified === true;
  const isFullyReady = isApproved && isVerified;

  const getMotivation = (rank: number) => {
    if (isPending) return "Preparation is the key to victory. Verify your email and phone now, so you're ready to campaign the moment you're approved!";
    if (rank === 0) return "Welcome! Share your link to start getting votes.";
    if (rank <= 3) return "You are in the Top 3! Keep pushing, the crown is within reach! 👑";
    if (rank <= 10) return "You're in the Top 10. Don't stop now, your supporters are counting on you! 🔥";
    if (rank <= 20) return "You are on the qualifying bubble. One more push from your church can secure your spot! ⚡";
    return "The race is not to the swift, but to those who endure. Share your link again and watch God work! 🙏";
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: contestant } = await supabase.from('contestants').select('*').eq('email', user.email).single();
      if (!contestant) { router.push('/login'); return; }
      
      setProfile(contestant);
      setEditForm({ email: contestant.email, phone: contestant.phone });

      if (contestant.status === 'approved') {
        const { count } = await supabase.from('contestants').select('*', { count: 'exact', head: true }).eq('status', 'approved').gt('total_votes', contestant.total_votes);
        setRank((count || 0) + 1);
      }

      const hasSeenTour = localStorage.getItem('tftc_tour_seen');
      if (!hasSeenTour) setShowTour(true);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const closeTour = () => {
    localStorage.setItem('tftc_tour_seen', 'true');
    setShowTour(false);
  };

  const handleVerifyEmail = async () => {
    showModal({
      title: 'Verification Sent',
      message: 'A verification link has been sent to your email. Click it to verify.',
      showCancel: false,
      confirmText: 'OK',
      onConfirm: async () => {
        // Simulate verification for demo
        await supabase.from('contestants').update({ email_verified: true }).eq('id', profile.id);
        setProfile({ ...profile, email_verified: true });
        hideModal();
      }
    });
  };

  const handleVerifyPhone = () => setShowSmsModal(true);

  const submitSmsCode = async () => {
    if (smsCode === '123456') {
      await supabase.from('contestants').update({ phone_verified: true }).eq('id', profile.id);
      setProfile({ ...profile, phone_verified: true });
      setShowSmsModal(false);
      setSmsCode('');
    } else {
      showModal({ title: 'Invalid Code', message: 'Please enter the correct 6-digit code (Demo: 123456).', showCancel: false, isDanger: true, onConfirm: hideModal });
    }
  };

  const saveContactInfo = async () => {
    await supabase.from('contestants').update({ 
      email: editForm.email, 
      phone: editForm.phone,
      email_verified: false,
      phone_verified: false
    }).eq('id', profile.id);
    
    setProfile({ ...profile, email: editForm.email, phone: editForm.phone, email_verified: false, phone_verified: false });
    setIsEditing(false);
  };

  const copyLink = () => {
    if (!isFullyReady) return;
    navigator.clipboard.writeText(`${window.location.origin}/vote/${profile.contestant_id}`);
    showModal({ title: 'Link Copied!', message: 'Your unique voting link has been copied to your clipboard.', showCancel: false, onConfirm: hideModal });
  };

  if (loading) return <div className="p-6 space-y-4 animate-pulse"><div className="h-24 bg-gray-200 rounded-xl"></div></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* GUIDE TOUR MODAL (unchanged) */}
      <AnimatePresence>
        {showTour && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Your Campaign Center</h2>
              <p className="text-sm text-gray-500 mb-6">Here is how you win the crown:</p>
              <div className="space-y-4 text-left mb-8">
                <div className="flex gap-3"><div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</div><p className="text-sm font-semibold">Verify your email and phone to unlock your link.</p></div>
                <div className="flex gap-3"><div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</div><p className="text-sm font-semibold">Share your unique link on WhatsApp and social media.</p></div>
                <div className="flex gap-3"><div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</div><p className="text-sm font-semibold">Track your rank and climb to the Top 20!</p></div>
              </div>
              <button onClick={closeTour} className="w-full bg-black text-white font-bold py-3 rounded-lg">Got it, Let's Go!</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the shared modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`p-4 text-center ${modal.isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-black ${modal.isDanger ? 'text-red-700' : 'text-green-700'}`}>{modal.title}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">{modal.message}</p>
              <div className="flex gap-2">
                {modal.showCancel && <button onClick={hideModal} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg">Cancel</button>}
                <button onClick={modal.onConfirm} className={`flex-1 text-white font-bold py-2.5 rounded-lg ${modal.isDanger ? 'bg-red-600' : 'bg-black'}`}>{modal.confirmText}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banners, Profile Card, Stats, Share tools (unchanged from previous) */}
      {isPending && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-full shrink-0"><Clock size={18} className="text-orange-600"/></div>
          <div>
            <h2 className="text-sm font-black text-orange-800">Application Under Review</h2>
            <p className="text-xs text-orange-700 mt-1">The admin is currently reviewing your media. Verify your contact info below while you wait.</p>
          </div>
        </div>
      )}

      {!isVerified && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-2"><Lock size={16}/> Verify Your Identity</h2>
          <p className="text-xs text-gray-500 mb-4">Unlock your campaign tools by verifying your contact info.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-xs font-bold truncate"><Mail size={14}/> {profile.email}</div>
              {profile.email_verified ? <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span> : <button onClick={handleVerifyEmail} className="bg-black text-white text-[10px] px-3 py-1.5 rounded-md shrink-0">Verify</button>}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 text-xs font-bold truncate"><Phone size={14}/> {profile.phone}</div>
              {profile.phone_verified ? <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span> : <button onClick={handleVerifyPhone} className="bg-black text-white text-[10px] px-3 py-1.5 rounded-md shrink-0">Verify</button>}
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="mt-3 text-[10px] font-bold text-gray-500 underline flex items-center gap-1"><Edit2 size={10}/> Edit Contact Info</button>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm border text-center relative overflow-hidden">
        <img src={profile.photo_url} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-md" />
        <h1 className="text-xl font-black text-gray-900">{profile.stage_name || profile.full_name}</h1>
        <p className="text-xs text-gray-500">{profile.contestant_id} • {profile.church}</p>
      </div>

      <div className={`grid grid-cols-2 gap-3 ${!isApproved ? 'opacity-50' : ''}`}>
        <div className="bg-white p-4 rounded-xl shadow-sm border text-center relative">
          {!isApproved && <div className="absolute top-2 right-2 text-gray-400"><Lock size={12}/></div>}
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Votes</div>
          <div className="text-3xl font-black text-black mt-1">{isApproved ? profile.total_votes.toLocaleString() : '0'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border text-center relative">
          {!isApproved && <div className="absolute top-2 right-2 text-gray-400"><Lock size={12}/></div>}
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Rank</div>
          <div className="text-3xl font-black text-black mt-1">{isApproved ? `#${rank}` : '-'}</div>
        </div>
      </div>

      <div className="bg-black text-white p-5 rounded-xl shadow-md text-center">
        <p className="font-bold italic text-sm">"{getMotivation(rank)}"</p>
      </div>

      <div className={`bg-white p-5 rounded-xl shadow-sm border ${!isFullyReady ? 'opacity-50' : ''}`}>
        <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          Your Unique Voting Link
          {!isFullyReady && <Lock size={14} className="text-gray-400"/>}
        </h2>
        <div className="flex gap-2">
          <input type="text" readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${profile.contestant_id}`} className="w-full p-2.5 bg-gray-50 border rounded-lg text-xs text-gray-600 outline-none" />
          <button onClick={copyLink} disabled={!isFullyReady} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-1 disabled:bg-gray-400"><Copy size={14}/> Copy</button>
        </div>
      </div>

      {/* Edit Modal and SMS Modal (unchanged, but with styling) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">Edit Contact Info</h3>
                <button onClick={() => setIsEditing(false)}><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-bold mb-1">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold mb-1">Phone</label><input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg text-sm">Cancel</button>
                <button onClick={saveContactInfo} className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-sm">Save & Re-Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSmsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <h3 className="text-lg font-black mb-2">Verify Phone</h3>
              <p className="text-xs text-gray-500 mb-2">Enter code sent to {profile.phone}</p>
              <p className="text-[10px] text-blue-600 mb-4 font-bold">(Demo Code: 123456)</p>
              <input type="text" maxLength={6} value={smsCode} onChange={e => setSmsCode(e.target.value)} className="w-full p-3 border rounded-lg text-center text-xl tracking-widest mb-4" placeholder="000000" />
              <div className="flex gap-2">
                <button onClick={() => setShowSmsModal(false)} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg text-sm">Cancel</button>
                <button onClick={submitSmsCode} className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-sm">Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
