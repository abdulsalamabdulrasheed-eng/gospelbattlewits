'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, votes: 0, total: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const { data: contestants } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    const { data: tx } = await supabase.from('transactions').select('amount').eq('status', 'success');

    if (contestants && tx) {
      const votes = contestants.reduce((sum, c) => sum + (c.total_votes || 0), 0);
      const revenue = tx.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
      const pending = contestants.filter(c => c.status === 'pending').length;
      
      setStats({ revenue, votes, total: contestants.length, pending });
      setRecent(contestants.filter(c => c.status === 'pending').slice(0, 5));
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time snapshot of the TFTC Live Show.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue</div>
            <div className="p-1.5 bg-green-50 rounded-md"><TrendingUp size={14} className="text-green-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-900">₦{stats.revenue.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Votes Cast</div>
            <div className="p-1.5 bg-blue-50 rounded-md"><CheckCircle2 size={14} className="text-blue-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.votes.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contestants</div>
            <div className="p-1.5 bg-purple-50 rounded-md"><Users size={14} className="text-purple-600" /></div>
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.total} <span className="text-sm text-gray-400 font-medium">/ 2000</span></div>
        </div>

        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Pending</div>
            <div className="p-1.5 bg-orange-100 rounded-md"><Clock size={14} className="text-orange-600" /></div>
          </div>
          <div className="text-2xl font-black text-orange-700">{stats.pending}</div>
        </div>
      </div>

      {/* Recent Applicants */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900">Recent Applicants</h2>
          <Link href="/admin/contestants" className="text-xs font-bold text-gray-500 hover:text-black underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No pending applicants.</div>
          ) : (
            recent.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">{c.full_name} {c.stage_name && <span className="text-gray-500">({c.stage_name})</span>}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.church} · {c.category}</div>
                </div>
                <Link href="/admin/contestants" className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition">Review</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
