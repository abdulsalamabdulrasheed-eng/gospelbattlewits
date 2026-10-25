'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, votes: 0, total: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch contestants
    const { data: contestants } = await supabase.from('contestants').select('*');
    
    // Fetch revenue
    const { data: tx } = await supabase.from('transactions').select('amount').eq('status', 'success');

    if (contestants && tx) {
      const votes = contestants.reduce((sum, c) => sum + (c.total_votes || 0), 0);
      const revenue = tx.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
      const pending = contestants.filter(c => c.status === 'pending').length;
      
      setStats({ revenue, votes, total: contestants.length, pending });
      
      // Get latest 5 pending applicants
      setRecent(contestants.filter(c => c.status === 'pending').slice(0, 5));
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="text-sm text-gray-500 font-bold uppercase">Revenue</div>
          <div className="text-3xl font-black text-green-600 mt-2">₦{stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="text-sm text-gray-500 font-bold uppercase">Votes Cast</div>
          <div className="text-3xl font-black text-black mt-2">{stats.votes.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="text-sm text-gray-500 font-bold uppercase">Contestants</div>
          <div className="text-3xl font-black text-black mt-2">{stats.total} / 2000</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
          <div className="text-sm text-orange-600 font-bold uppercase">Pending</div>
          <div className="text-3xl font-black text-orange-700 mt-2">{stats.pending}</div>
        </div>
      </div>

      {/* Recent Applicants */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg">Recent Applicants</h2>
          <Link href="/admin/contestants" className="text-sm font-bold underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No pending applicants.</div>
          ) : (
            recent.map(c => (
              <div key={c.id} className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-bold">{c.full_name} {c.stage_name && `(${c.stage_name})`}</div>
                  <div className="text-sm text-gray-500">{c.church} · {c.category}</div>
                </div>
                <Link href="/admin/contestants" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Review</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
