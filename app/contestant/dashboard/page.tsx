'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, Edit2, CheckCircle2, Lock, X, Copy } from 'lucide-react';

export default function ContestantDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  
  // Mock SMS State
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsCode, setSmsCode] = useState('');

  const getMotivation = (rank: number) => {
    if (rank === 0) return "Welcome! Share your link to start getting votes.";
    if (rank <= 3) return "You are in the Top 3! Keep pushing, the crown is within reach! 👑";
    if (rank <= 10) return "You're in the Top 10. Don't stop now, your supporters are counting on you! 🔥";
    if (rank <= 20) return "You are on the qualifying bubble. One more push from your church can secure your spot! ⚡";
    return "The race is not to the swift, but to those who endure. Share your link again and watch God work! 🙏";
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/contestant/login');
        return;
      }

      const { data: contestant } = await supabase.from('contestants').select('*').eq('email', user.email).single();

      if (!contestant) {
        router.push('/contestant/login');
        return;
      }
      setProfile(contestant);
      setEditForm({ email: contestant.email, phone: contestant.phone });

      if (contestant.status === 'approved') {
        const { count } = await supabase.from('contestants').select('*', { count: 'exact', head: true }).eq('status', 'approved').gt('total_votes', contestant.total_votes);
        setRank((count || 0) + 1);
      }

      const { data: txData } = await supabase.from('transactions').select('*').eq('contestant_id', contestant.id).order('created_at', { ascending: false }).limit(20);
      if (txData) setVoters(txData);
      
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/contestant/login');
  };

  const isVerified = profile?.email_verified && profile?.phone_verified;

  const handleVerifyEmail = async () => {
    // In a real app, Supabase sends a magic link. For this demo, we simulate it.
    alert("A verification link has been sent to your email. Click it to verify.");
    // Simulate verification for the demo
    setTimeout(async () => {
      await supabase.from('contestants').update({ email_verified: true }).eq('id', profile.id);
      setProfile({ ...profile, email_verified: true });
    }, 3000);
  };

  const handleVerifyPhone = () => {
    setShowSmsModal(true);
  };

  const submitSmsCode = async () => {
    if (smsCode === '123456') {
      await supabase.from('contestants').update({ phone_verified: true }).eq('id', profile.id);
      setProfile({ ...profile, phone_verified: true });
      setShowSmsModal(false);
      setSmsCode('');
    } else {
      alert("Invalid code. Try 123456");
    }
  };

  const saveContactInfo = async () => {
    await supabase.from('contestants').update({ 
      email: editForm.email, 
      phone: editForm.phone,
      email_verified: false, // Reset verification on change
      phone_verified: false
    }).eq('id', profile.id);
    
    setProfile({ ...profile, email: editForm.email, phone: editForm.phone, email_verified: false, phone_verified: false });
    setIsEditing(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/vote/${profile.contestant_id}`);
    alert("Link copied to clipboard!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Dashboard...</div>;

  if (profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck size={32}/></div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Application Under Review</h1>
          <p className="text-gray-500 text-sm mb-6">Your payment was successful! The admin is currently reviewing your media. You will be notified once approved.</p>
          <button onClick={handleLogout} className="w-full bg-black text-white font-bold py-3 rounded-lg">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-lg">My Dashboard</div>
        <button onClick={handleLogout} className="text-sm bg-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-700">Logout</button>
      </div>

      <div className="max-w-3xl mx-auto p-4 mt-6 space-y-6">
        
        {/* Verification Gate */}
        {!isVerified && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
            <h2 className="text-lg font-black text-orange-600 mb-2 flex items-center gap-2"><Lock size={18}/> Verify Your Identity</h2>
            <p className="text-sm text-gray-600 mb-4">You must verify your email and phone number to unlock your share buttons and start campaigning.</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-bold"><Mail size={16}/> {profile.email}</div>
                {profile.email_verified ? <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Verified</span> : <button onClick={handleVerifyEmail} className="bg-black text-white text-xs px-3 py-1.5 rounded-md">Verify Email</button>}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-bold"><Phone size={16}/> {profile.phone}</div>
                {profile.phone_verified ? <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Verified</span> : <button onClick={handleVerifyPhone} className="bg-black text-white text-xs px-3 py-1.5 rounded-md">Verify Phone</button>}
              </div>
            </div>

            <button onClick={() => setIsEditing(true)} className="mt-4 text-xs font-bold text-gray-500 underline flex items-center gap-1"><Edit2 size={12}/> Edit Contact Info</button>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <img src={profile.photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
          <h1 className="text-2xl font-black text-gray-900">{profile.stage_name || profile.full_name}</h1>
          <p className="text-sm text-gray-500">{profile.contestant_id} • {profile.church}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <div className="text-sm font-bold text-gray-500 uppercase">Total Votes</div>
            <div className="text-4xl font-black text-black mt-2">{profile.total_votes.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-center">
            <div className="text-sm font-bold text-gray-500 uppercase">Current Rank</div>
            <div className="text-4xl font-black text-black mt-2">#{rank}</div>
          </div>
        </div>

        {/* Motivation */}
        <div className="bg-black text-white p-6 rounded-2xl shadow-md text-center">
          <p className="font-bold italic text-lg">"{getMotivation(rank)}"</p>
        </div>

        {/* Share Tools (Locked if not verified) */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold text-gray-900 mb-2">Your Unique Voting Link</h2>
          <div className="flex gap-2">
            <input type="text" readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${profile.contestant_id}`} className="w-full p-3 bg-gray-50 border rounded-lg text-sm text-gray-600 outline-none" />
            <button onClick={copyLink} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap flex items-center gap-1"><Copy size={14}/> Copy</button>
          </div>
        </div>

        {/* Voter Log */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="font-bold text-lg">Recent Supporters</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {voters.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No votes yet. Start sharing your link!</div>
            ) : (
              voters.map(v => (
                <div key={v.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{v.voter_email.split('@')[0]}</div>
                    <div className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  <div className="font-black text-green-600">+{v.votes_credited} votes</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">Edit Contact Info</h3>
                <button onClick={() => setIsEditing(false)}><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold mb-1">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full p-3 border rounded-lg" /></div>
                <div><label className="block text-sm font-bold mb-1">Phone</label><input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-3 border rounded-lg" /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-black font-bold py-3 rounded-lg">Cancel</button>
                <button onClick={saveContactInfo} className="flex-1 bg-black text-white font-bold py-3 rounded-lg">Save & Re-Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mock SMS Modal */}
      <AnimatePresence>
        {showSmsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <h3 className="text-lg font-black mb-2">Verify Phone</h3>
              <p className="text-sm text-gray-500 mb-4">Enter the 6-digit code sent to {profile.phone}</p>
              <p className="text-xs text-blue-600 mb-2 font-bold">(Demo Code: 123456)</p>
              <input type="text" maxLength={6} value={smsCode} onChange={e => setSmsCode(e.target.value)} className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest mb-4" placeholder="000000" />
              <div className="flex gap-2">
                <button onClick={() => setShowSmsModal(false)} className="flex-1 bg-gray-200 text-black font-bold py-3 rounded-lg">Cancel</button>
                <button onClick={submitSmsCode} className="flex-1 bg-black text-white font-bold py-3 rounded-lg">Verify</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
