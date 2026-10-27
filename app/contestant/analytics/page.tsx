'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      const { data: contestant } = await supabase.from('contestants').select('*').eq('email', user.email).single();
      if (!contestant) { router.push('/login'); return; }
      setProfile(contestant);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('contestant_id', contestant.id)
        .eq('status', 'success')
        .order('created_at', { ascending: true });

      if (txData) {
        setTransactions(txData);

        // Group by last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        }).reverse();

        const data = last7Days.map(date => {
          const dayVotes = txData
            .filter(t => new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) === date)
            .reduce((sum, t) => sum + t.votes_credited, 0);
          return { date, votes: dayVotes };
        });
        setChartData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return <div className="p-6 text-sm font-bold text-gray-500">Loading...</div>;

  const totalVotes = transactions.reduce((sum, t) => sum + t.votes_credited, 0);
  const uniqueSupporters = new Set(transactions.map(t => t.voter_email)).size;
  const bestDay = [...chartData].sort((a, b) => b.votes - a.votes)[0];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">Track your campaign performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border shadow-sm text-center">
          <div className="p-1.5 bg-blue-50 w-fit mx-auto rounded-md mb-1"><TrendingUp size={14} className="text-blue-600"/></div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Total Votes</div>
          <div className="text-xl font-black text-gray-900 mt-0.5">{totalVotes}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border shadow-sm text-center">
          <div className="p-1.5 bg-purple-50 w-fit mx-auto rounded-md mb-1"><Users size={14} className="text-purple-600"/></div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Supporters</div>
          <div className="text-xl font-black text-gray-900 mt-0.5">{uniqueSupporters}</div>
        </div>
        <div className="bg-white p-3 rounded-xl border shadow-sm text-center">
          <div className="p-1.5 bg-green-50 w-fit mx-auto rounded-md mb-1"><Heart size={14} className="text-green-600"/></div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Best Day</div>
          <div className="text-xs font-black text-gray-900 mt-1">{bestDay?.date || '-'}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={16}/> Votes (Last 7 Days)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
              <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              <Bar dataKey="votes" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-sm font-bold text-gray-900">Recent Supporters</h2>
        </div>
        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">No votes yet.</div>
          ) : (
            transactions.slice(-10).reverse().map(tx => (
              <div key={tx.id} className="p-3 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900">{tx.voter_email.split('@')[0]}</div>
                  <div className="text-gray-500">{new Date(tx.created_at).toLocaleString()}</div>
                </div>
                <div className="font-black text-green-600">+{tx.votes_credited} votes</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
