'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  total_votes: number;
  photo_url: string;
}

export default function Home() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalView, setModalView] = useState('select'); // 'select', 'voter', 'contestant'

  useEffect(() => {
    fetchContestants();
    checkAuthStatus();
  }, []);

  const fetchContestants = async () => {
    const { data } = await supabase.from('contestants').select('*').eq('status', 'approved').order('total_votes', { ascending: false }).limit(4);
    if (data) setContestants(data);
    setLoading(false);
  };

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if contestant
      const { data } = await supabase.from('contestants').select('id').eq('email', user.email).single();
      if (data) setIsLoggedIn(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-xl font-bold">Loading Talent...</div></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold">✕</button>
            
            {modalView === 'select' && (
              <div className="text-center">
                <h3 className="text-xl font-black mb-2">Welcome Back</h3>
                <p className="text-gray-500 text-sm mb-6">Who are you?</p>
                <div className="space-y-3">
                  <button onClick={() => setModalView('voter')} className="w-full bg-gray-100 text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">I'm a Voter</button>
                  <button onClick={() => setModalView('contestant')} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">I'm a Contestant</button>
                </div>
                <div className="mt-6">
                  <button onClick={() => window.location.href='/login'} className="text-xs text-gray-400 hover:text-black underline">Something else?</button>
                </div>
              </div>
            )}

            {modalView === 'voter' && (
              <div className="text-center">
                <div className="text-4xl mb-4">🗳️</div>
                <h3 className="text-xl font-black mb-2">Great News!</h3>
                <p className="text-gray-500 text-sm mb-6">You don't need an account to vote. Just click on any contestant and pay to support them.</p>
                <Link href="/leaderboard" className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition mb-2">Start Voting Now</Link>
                <button onClick={() => setModalView('select')} className="text-sm text-gray-500 hover:text-black">Go Back</button>
              </div>
            )}

            {modalView === 'contestant' && (
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-black mb-2">Welcome, Contestant!</h3>
                <p className="text-gray-500 text-sm mb-6">You are highly expected. Please log in to see your votes, or register below to compete.</p>
                <Link href="/login" className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition mb-2">Contestant Login</Link>
                <Link href="/register" className="block w-full bg-white border-2 border-black text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition">Apply to Compete</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-black text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">VOTE YOUR FAVOURITE</h1>
        <p className="text-gray-400 max-w-lg mx-auto mb-8">The top 20 contestants with the highest votes will battle live on stage. Every vote brings them closer to ₦500,000.</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {isLoggedIn && <Link href="/contestant/dashboard" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition">Go to Dashboard</Link>}
          <button onClick={() => setShowLoginModal(true)} className="inline-block bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition">Login</button>
          <Link href="/register" className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-black transition">Apply to Compete</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">Top Contestants</h2>
          <Link href="/leaderboard" className="text-sm font-bold text-gray-500 hover:text-black underline">See all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contestants.map((contestant, index) => (
            <Link href={`/vote/${contestant.contestant_id}`} key={contestant.id}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                <div className="aspect-square bg-gray-100 relative">
                  {contestant.photo_url ? <img src={contestant.photo_url} alt={contestant.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>}
                  {index < 3 && <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">#{index + 1}</div>}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-bold text-gray-900 truncate">{contestant.stage_name || contestant.full_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{contestant.church}</p>
                  <div className="mt-3 flex items-center justify-between border-t pt-2">
                    <div className="font-black text-black">{contestant.total_votes.toLocaleString()}</div>
                    <div className="bg-black text-white text-xs px-3 py-1 rounded-md font-bold">VOTE</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 text-center z-50">
        <p className="text-sm font-bold">🔥 Voting is LIVE. Support your church today!</p>
      </div>
    </main>
  );
}
