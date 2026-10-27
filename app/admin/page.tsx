'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { TrendingUp, Users, CheckCircle2, Clock, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, votes: 0, total: 0, pending: 0, voters: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    // 1. Fetch Contestants
    const { data: contestants } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    
    // 2. Fetch Transactions
    const { data: tx } = await supabase.from('transactions').select('*').eq('status', 'success').order('created_at', { ascending: true });

    if (contestants && tx) {
      const votes = contestants.reduce((sum, c) => sum + (c.total_votes || 0), 0);
      const revenue = tx.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
      const pending = contestants.filter(c => c.status === 'pending').length;
      const uniqueVoters = new Set(tx.map(t => t.voter_email)).size;

      setStats({ revenue, votes, total: contestants.length, pending, voters: uniqueVoters });

      // 3. Prepare Revenue Chart Data (Group by Date)
      const groupedTx = tx.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (!acc[date]) acc[date] = { date, revenue: 0 };
        acc[date].revenue += curr.amount / 100;
        return acc;
      }, {});
      setChartData(Object.values(groupedTx).slice(-7)); // Last 7 days

      // 4. Prepare Pie Chart Data (Top 5 Contestants)
      const topContestants = [...contestants]
        .filter(c => c.status === 'approved')
        .sort((a, b) => b.total_votes - a.total_votes)
        .slice(0, 5)
        .map(c => ({ name: c.stage_name || c.full_name, value: c.total_votes }));
      setPieData(topContestants);

      // 5. Recent Transactions Feed
      setRecentTx(tx.slice(-5).reverse());
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading Analytics...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Live analytics for TFTC Live Show.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live System
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gross Revenue</div>
            <TrendingUp size={14} className="text-green-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">₦{stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Votes</div>
            <CheckCircle2 size={14} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.votes.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voters</div>
            <Users size={14} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.voters}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contestants</div>
            <Users size={14} className="text-gray-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.total} <span className="text-xs text-gray-400">/ 2000</span></div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Pending</div>
            <Clock size={14} className="text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-700">{stats.pending}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(val) => `₦${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₦${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} dot={{r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vote Distribution Pie */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Top 5 Vote Share</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} votes`, 'Votes']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Feed & Pending Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Live Feed */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-700" />
              <h2 className="text-sm font-bold text-gray-900">Live Vote Feed</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100 h-64 overflow-y-auto">
            {recentTx.map(tx => (
              <div key={tx.id} className="p-3 flex justify-between items-center text-sm hover:bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-900">{tx.voter_email.split('@')[0]}</span>
                  <span className="text-gray-500"> just bought </span>
                  <span className="font-bold text-black">{tx.votes_credited} votes</span>
                </div>
                <div className="font-black text-green-600">+₦{(tx.amount / 100).toLocaleString()}</div>
              </div>
            ))}
            {recentTx.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No votes yet.</div>}
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900">Pending Applicants</h2>
            <Link href="/admin/contestants" className="text-xs font-bold text-gray-500 hover:text-black underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-100 h-64 overflow-y-auto">
            {stats.pending === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">You're all caught up!</div>
            ) : (
              // Quick fetch of pending for the list
              <div className="p-4 text-center text-sm text-gray-500">Go to Contestants tab to review pending applications.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
