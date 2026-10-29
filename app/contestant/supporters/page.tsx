'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';

export default function MySupporters() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: contestant } = await supabase.from('contestants').select('id').eq('email', user.email).single();
      if (!contestant) { router.push('/login'); return; }

      const { data: tx } = await supabase
        .from('transactions')
        .select('id, voter_email, votes_credited, created_at')
        .eq('contestant_id', contestant.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (tx) setTransactions(tx);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const filtered = transactions.filter(tx => 
    tx.voter_email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 font-bold">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-black text-white rounded-lg"><Users size={20}/></div>
        <div>
          <h1 className="text-xl font-black text-gray-900">My Supporters</h1>
          <p className="text-xs text-gray-500">See who has been voting for you.</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border shadow-sm">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No supporters found.</div>
          ) : (
            filtered.map((tx, index) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">
                      {tx.voter_email.split('@')[0].replace(/[0-9]/g, '') || 'Anonymous'}
                    </div>
                    <div className="text-[10px] text-gray-500">{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-xs font-bold border border-green-100">
                  +{tx.votes_credited} votes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
