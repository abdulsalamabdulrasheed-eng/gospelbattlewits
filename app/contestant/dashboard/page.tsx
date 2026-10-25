'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function ContestantDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Motivation Quotes based on rank
  const getMotivation = (rank: number) => {
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

      // 1. Get contestant profile
      const { data: contestant } = await supabase
        .from('contestants')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!contestant) {
        router.push('/contestant/login');
        return;
      }
      setProfile(contestant);

      // 2. Calculate Rank (count how many people have more votes)
      const { count } = await supabase
        .from('contestants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gt('total_votes', contestant.total_votes);
      
      setRank((count || 0) + 1);

      // 3. Fetch voter log (transactions for this contestant)
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('contestant_id', contestant.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txData) setVoters(txData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/contestant/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar */}
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-lg">My Dashboard</div>
        <button onClick={handleLogout} className="text-sm bg-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-700">Logout</button>
      </div>

      <div className="max-w-3xl mx-auto p-4 mt-6 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          <img src={profile.photo_url} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
          <h1 className="text-2xl font-black text-gray-900">{profile.stage_name || profile.full_name}</h1>
          <p className="text-sm text-gray-500">{profile.contestant_id} • {profile.church}</p>
        </div>

        {/* Stats Grid */}
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

        {/* Motivation Box */}
        <div className="bg-black text-white p-6 rounded-2xl shadow-md text-center">
          <p className="font-bold italic text-lg">"{getMotivation(rank)}"</p>
        </div>

        {/* Share Link */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-bold text-gray-900 mb-2">Your Unique Voting Link</h2>
          <p className="text-sm text-gray-500 mb-4">Share this link on WhatsApp and social media to get votes.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${profile.contestant_id}`} 
              className="w-full p-3 bg-gray-50 border rounded-lg text-sm text-gray-600 outline-none"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/vote/${profile.contestant_id}`)}
              className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
            >
              Copy
            </button>
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
    </div>
  );
}
