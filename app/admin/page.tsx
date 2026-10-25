'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  status: string;
  total_votes: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    // 1. Verify user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // 2. Fetch contestants
    const { data: contestantsData } = await supabase
      .from('contestants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (contestantsData) {
      setContestants(contestantsData);
      const votes = contestantsData.reduce((sum, c) => sum + (c.total_votes || 0), 0);
      setTotalVotes(votes);
    }

    // 3. Fetch revenue from transactions table
    const { data: txData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'success');
    
    if (txData) {
      // Amount is stored in kobo, so divide by 100
      const rev = txData.reduce((sum, t) => sum + (t.amount || 0), 0);
      setTotalRevenue(rev / 100); 
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const handleApprove = async (id: string) => {
    await supabase.from('contestants').update({ status: 'approved' }).eq('id', id);
    checkAuthAndFetch();
  };

  const handleReject = async (id: string) => {
    await supabase.from('contestants').update({ status: 'rejected' }).eq('id', id);
    checkAuthAndFetch();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar */}
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-lg">Admin Dashboard</div>
        <button onClick={handleLogout} className="text-sm bg-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition">Logout</button>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 mt-4">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-black text-green-600 mt-1">₦{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Votes</div>
            <div className="text-2xl font-black text-black mt-1">{totalVotes.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Contestants</div>
            <div className="text-2xl font-black text-black mt-1">{contestants.length} / 2000</div>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">Pending</div>
            <div className="text-2xl font-black text-orange-500 mt-1">
              {contestants.filter(c => c.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* Applicant Queue */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-bold text-lg">Contestant Queue</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {contestants.map((c) => (
              <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">{c.stage_name || c.full_name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono border">{c.contestant_id}</span>
                  </div>
                  <div className="text-sm text-gray-500">{c.church}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    c.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                  
                  {c.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(c.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition">Approve</button>
                      <button onClick={() => handleReject(c.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {contestants.length === 0 && (
              <div className="p-8 text-center text-gray-500 font-semibold">No contestants in the queue yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
