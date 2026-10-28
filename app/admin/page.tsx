'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { TrendingUp, Users, CheckCircle2, Clock, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from 'recharts';

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, votes: 0, total: 0, pending: 0, voters: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [voteShareData, setVoteShareData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const { data: contestants } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    const { data: tx } = await supabase.from('transactions').select('*').eq('status', 'success').order('created_at', { ascending: true });

    if (contestants && tx) {
      const votes = contestants.reduce((sum, c) => sum + (c.total_votes || 0), 0);
      const revenue = tx.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
      const pending = contestants.filter(c => c.status === 'pending').length;
      const uniqueVoters = new Set(tx.map(t => t.voter_email)).size;

      setStats({ revenue, votes, total: contestants.length, pending, voters: uniqueVoters });

      // Revenue Trend (Last 7 Days)
      const groupedTx = tx.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (!acc[date]) acc[date] = { date, revenue: 0 };
        acc[date].revenue += curr.amount / 100;
        return acc;
      }, {});
      setRevenueData(Object.values(groupedTx).slice(-7));

      // Vote Share (Top 5)
      const topContestants = [...contestants]
        .filter(c => c.status === 'approved')
        .sort((a, b) => b.total_votes - a.total_votes)
        .slice(0, 5)
        .map(c => ({ name: c.stage_name || c.full_name, votes: c.total_votes }));
      setVoteShareData(topContestants);

      setRecentTx(tx.slice(-5).reverse());
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading Analytics...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Live analytics for TFTC Live Show.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live
        </div>
      </div>

      {/* KPI Cards - Fixed Responsiveness */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue</div>
            <TrendingUp size={14} className="text-green-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-gray-900 truncate">₦{stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Votes</div>
            <CheckCircle2 size={14} className="text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-gray-900 truncate">{stats.votes.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voters</div>
            <Users size={14} className="text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-gray-900 truncate">{stats.voters}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contestants</div>
            <Users size={14} className="text-gray-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-gray-900 truncate">{stats.total} <span className="text-xs text-gray-400">/ 2000</span></div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Pending</div>
            <Clock size={14} className="text-orange-600" />
          </div>
          <div className="text-xl md:text-2xl font-black text-orange-700 truncate">{stats.pending}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Revenue Chart */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(val) => `₦${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} formatter={(value: any) => [`₦${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} dot={{r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No revenue data yet.</div>
            )}
          </div>
        </div>

        {/* Vote Share Bar Chart (Replaces broken Pie) */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Top 5 Vote Share</h2>
          <div className="h-64">
            {voteShareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voteShareData} layout="vertical" margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#6B7280'}} width={80} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={20}>
                    {voteShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No approved contestants yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Live Feed & Pending Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-700" />
              <h2 className="text-sm font-bold text-gray-900">Live Vote Feed</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 h-64 overflow-y-auto">
            {recentTx.map(tx => (
              <div key={tx.id} className="p-3 flex justify-between items-center text-xs hover:bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-900">{tx.voter_email.split('@')[0]}</span>
                  <span className="text-gray-500"> bought </span>
                  <span className="font-bold text-black">{tx.votes_credited} votes</span>
                </div>
                <div className="font-black text-green-600">+₦{(tx.amount / 100).toLocaleString()}</div>
              </div>
            ))}
            {recentTx.length === 0 && <div className="p-6 text-center text-gray-500 text-xs">No votes yet.</div>}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900">Pending Applicants</h2>
            <Link href="/admin/contestants" className="text-xs font-bold text-gray-500 hover:text-black underline">View All</Link>
          </div>
          <div className="p-6 text-center text-xs text-gray-500 h-64 flex flex-col items-center justify-center">
            {stats.pending === 0 ? (
              <span>You're all caught up!</span>
            ) : (
              <Link href="/admin/contestants" className="bg-black text-white px-4 py-2 rounded-lg font-bold">Review {stats.pending} Pending</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
