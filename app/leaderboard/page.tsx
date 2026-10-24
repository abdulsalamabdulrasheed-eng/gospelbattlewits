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

export default function Leaderboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [filtered, setFiltered] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(contestants);
    } else {
      const lowerSearch = search.toLowerCase();
      setFiltered(contestants.filter(c => 
        c.full_name.toLowerCase().includes(lowerSearch) || 
        (c.stage_name && c.stage_name.toLowerCase().includes(lowerSearch)) ||
        c.contestant_id.toLowerCase().includes(lowerSearch)
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
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Leaderboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Link href="/" className="text-sm font-bold">← Home</Link>
        <span className="font-bold text-lg">Live Leaderboard</span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or ID (e.g., TFTC-0001)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-semibold">No contestants found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((contestant, index) => {
                // Find true rank (based on full list, not filtered list)
                const trueRank = contestants.findIndex(c => c.id === contestant.id) + 1;
                
                return (
                  <Link href={`/vote/${contestant.contestant_id}`} key={contestant.id}>
                    <div className="flex items-center p-4 hover:bg-gray-50 transition cursor-pointer">
                      {/* Rank */}
                      <div className="w-10 text-center font-black text-lg text-gray-400">
                        {trueRank <= 3 ? (
                          <span className={trueRank === 1 ? 'text-yellow-500' : trueRank === 2 ? 'text-gray-400' : 'text-amber-700'}>
                            {trueRank}
                          </span>
                        ) : (
                          trueRank
                        )}
                      </div>

                      {/* Photo */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mx-4 flex-shrink-0">
                        {contestant.photo_url && (
                          <img src={contestant.photo_url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{contestant.stage_name || contestant.full_name}</h3>
                        <p className="text-xs text-gray-500 truncate">{contestant.contestant_id} • {contestant.church}</p>
                      </div>

                      {/* Votes */}
                      <div className="text-right ml-4">
                        <div className="font-black text-lg text-black">{contestant.total_votes.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Votes</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
