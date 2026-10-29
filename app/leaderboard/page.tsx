'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Search, TrendingUp, Medal, Star } from 'lucide-react';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  total_votes: number;
  photo_url: string;
  created_at: string;
}

export default function Leaderboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [filtered, setFiltered] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [floatingVotes, setFloatingVotes] = useState<{ id: string; amount: number }[]>([]);

  useEffect(() => {
    fetchLeaderboard();

    const subscription = supabase
      .channel('public:leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contestants' }, (payload) => {
        const updated = payload.new as Contestant;
        setContestants((current) => {
          const existing = current.find(c => c.id === updated.id);
          if (existing && updated.total_votes > existing.total_votes) {
            const diff = updated.total_votes - existing.total_votes;
            setFloatingVotes((prev) => [...prev, { id: updated.id, amount: diff }]);
            setTimeout(() => setFloatingVotes((prev) => prev.filter(v => v.id !== updated.id)), 1500);
          }
          const newList = current.map(c => c.id === updated.id ? updated : c);
          // Sort by votes DESC, then created_at ASC (Tie-Breaker)
          return newList.sort((a, b) => {
            if (b.total_votes !== a.total_votes) return b.total_votes - a.total_votes;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });
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
      .order('total_votes', { ascending: false })
      .order('created_at', { ascending: true }); // Tie-breaker
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
    <main className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md text-white p-4 sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-sm font-bold hover:text-yellow-500">← Home</Link>
          <h1 className="text-lg font-black tracking-wider uppercase text-yellow-500">Live Leaderboard</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        
        {/* Majestic Podium */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-12 items-end relative">
          
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link href={`/vote/${top3[1].contestant_id}`} className="block group">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-2xl rounded-b-xl p-3 md:p-5 border-t-4 border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.2)] text-center relative transition-transform group-hover:-translate-y-2">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Medal size={12}/> 2nd</div>
                  <img src={top3[1].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-gray-400 mt-4" />
                  <h3 className="text-xs md:text-sm font-black text-white truncate">{top3[1].stage_name || top3[1].full_name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 truncate">{top3[1].church}</p>
                  <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-gray-300">{top3[1].total_votes.toLocaleString()}</div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Link href={`/vote/${top3[0].contestant_id}`} className="block group">
                <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-900/10 rounded-t-2xl rounded-b-xl p-4 md:p-6 border-t-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] text-center relative transition-transform group-hover:-translate-y-2 z-10">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs md:text-sm font-black px-4 py-2 rounded-full flex items-center gap-1 shadow-xl"><Crown size={16}/> 1st</div>
                  <img src={top3[0].photo_url} className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-yellow-500 mt-6 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                  <h3 className="text-sm md:text-base font-black text-white truncate">{top3[0].stage_name || top3[0].full_name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-300 truncate">{top3[0].church}</p>
                  <div className="mt-2 md:mt-3 text-2xl md:text-3xl font-black text-yellow-500 drop-shadow-md">{top3[0].total_votes.toLocaleString()}</div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link href={`/vote/${top3[2].contestant_id}`} className="block group">
                <div className="bg-gradient-to-b from-amber-900/40 to-black rounded-t-2xl rounded-b-xl p-3 md:p-5 border-t-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.2)] text-center relative transition-transform group-hover:-translate-y-2">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><Medal size={12}/> 3rd</div>
                  <img src={top3[2].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-amber-700 mt-4" />
                  <h3 className="text-xs md:text-sm font-black text-white truncate">{top3[2].stage_name || top3[2].full_name}</h3>
                  <p className="text-[10px] md:text-xs text-gray-400 truncate">{top3[2].church}</p>
                  <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-amber-500">{top3[2].total_votes.toLocaleString()}</div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, church, or TFTC ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-gray-800 rounded-xl shadow-sm outline-none focus:border-yellow-500 text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* Rest of the List (Rank 4+) */}
        <div className="bg-[#1A1A1A] rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-800">
            {rest.map((c) => {
              const trueRank = contestants.findIndex(x => x.id === c.id) + 1;
              const floating = floatingVotes.find(v => v.id === c.id);
              return (
                <Link href={`/vote/${c.contestant_id}`} key={c.id} className="flex items-center p-4 hover:bg-gray-800/50 transition relative">
                  <div className="w-10 text-center font-black text-gray-500 text-lg">{trueRank}</div>
                  <img src={c.photo_url} className="w-12 h-12 rounded-full object-cover mx-4 border border-gray-700" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{c.stage_name || c.full_name}</h3>
                    <p className="text-xs text-gray-500 truncate">{c.contestant_id} • {c.church}</p>
                  </div>
                  <div className="text-right ml-4 relative">
                    <div className="font-black text-base text-white">{c.total_votes.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Votes</div>
                    <AnimatePresence>
                      {floating && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, y: -40 }} className="absolute right-0 -top-4 bg-green-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-md z-10">
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
