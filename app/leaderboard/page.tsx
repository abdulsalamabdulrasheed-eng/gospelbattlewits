'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Search, TrendingUp } from 'lucide-react';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  total_votes: number;
  photo_url: string;
}

export default function Leaderboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [filtered, setFiltered] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [floatingVotes, setFloatingVotes] = useState<{ id: string; amount: number }[]>([]);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contestants' }, (payload) => {
        const updated = payload.new as Contestant;
        
        // Update the state
        setContestants((current) => {
          const existing = current.find(c => c.id === updated.id);
          if (existing && updated.total_votes > existing.total_votes) {
            const diff = updated.total_votes - existing.total_votes;
            // Trigger floating animation
            setFloatingVotes((prev) => [...prev, { id: updated.id, amount: diff }]);
            setTimeout(() => setFloatingVotes((prev) => prev.filter(v => v.id !== updated.id)), 1500);
          }
          
          const newList = current.map(c => c.id === updated.id ? updated : c);
          return newList.sort((a, b) => b.total_votes - a.total_votes);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(contestants);
    } else {
      const lower = search.toLowerCase();
      setFiltered(contestants.filter(c => 
        c.full_name.toLowerCase().includes(lower) || 
        (c.stage_name && c.stage_name.toLowerCase().includes(lower)) ||
        c.contestant_id.toLowerCase().includes(lower) ||
        c.church.toLowerCase().includes(lower)
      ));
    }
  }, [search, contestants]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('contestants')
      .select('*')
      .eq('status', 'approved')
      .order('total_votes', { ascending: false });
    if (data) {
      setContestants(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Leaderboard...</div>;

  const top3 = contestants.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-sm font-bold">← Home</Link>
          <h1 className="text-lg font-black tracking-wider uppercase">Live Leaderboard</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        
        {/* Podium (Top 3) */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <Link href={`/vote/${top3[1].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-3 md:p-5 border-2 border-gray-300 shadow-lg text-center relative transition-transform group-hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-black px-3 py-1 rounded-full">2nd</div>
                <img src={top3[1].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-2 border-gray-300 mt-2" />
                <h3 className="text-xs md:text-sm font-black truncate">{top3[1].stage_name || top3[1].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[1].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-gray-800">{top3[1].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <Link href={`/vote/${top3[0].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-4 md:p-6 border-4 border-yellow-500 shadow-2xl text-center relative transition-transform group-hover:-translate-y-1 bg-gradient-to-b from-yellow-50 to-white z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg"><Crown size={14}/> 1st</div>
                <img src={top3[0].photo_url} className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-yellow-500 mt-2 shadow-md" />
                <h3 className="text-sm md:text-base font-black truncate">{top3[0].stage_name || top3[0].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[0].church}</p>
                <div className="mt-2 md:mt-3 text-2xl md:text-3xl font-black text-yellow-600">{top3[0].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Link href={`/vote/${top3[2].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-3 md:p-5 border-2 border-amber-600 shadow-lg text-center relative transition-transform group-hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-full">3rd</div>
                <img src={top3[2].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-2 border-amber-600 mt-2" />
                <h3 className="text-xs md:text-sm font-black truncate">{top3[2].stage_name || top3[2].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[2].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-amber-700">{top3[2].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, church, or TFTC ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:border-black text-sm"
          />
        </div>

        {/* Rest of the List (Rank 4+) */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-100">
            {rest.map((c, index) => {
              const trueRank = contestants.findIndex(x => x.id === c.id) + 1;
              const floating = floatingVotes.find(v => v.id === c.id);
              return (
                <Link href={`/vote/${c.contestant_id}`} key={c.id} className="flex items-center p-4 hover:bg-gray-50 transition relative">
                  <div className="w-10 text-center font-black text-gray-400 text-lg">{trueRank}</div>
                  <img src={c.photo_url} className="w-12 h-12 rounded-full object-cover mx-4 border border-gray-200" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{c.stage_name || c.full_name}</h3>
                    <p className="text-xs text-gray-500 truncate">{c.contestant_id} • {c.church}</p>
                  </div>
                  <div className="text-right ml-4 relative">
                    <div className="font-black text-base text-black">{c.total_votes.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Votes</div>
                    
                    {/* Floating Vote Animation */}
                    <AnimatePresence>
                      {floating && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -20, scale: 1 }}
                          exit={{ opacity: 0, y: -40 }}
                          className="absolute right-0 -top-4 bg-green-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-md z-10"
                        >
                          +{floating.amount}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              );
            })}
            {rest.length === 0 && search !== '' && (
              <div className="p-8 text-center text-gray-500">No contestants found for "{search}".</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
