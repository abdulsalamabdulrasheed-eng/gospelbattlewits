'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams } from 'next/navigation';
import { Download, Receipt, Search, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ContestantVoters() {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: c, error: cError } = await supabase.from('contestants').select('*').eq('contestant_id', id).single();
      if (cError || !c) { setLoading(false); return; }
      setContestant(c);
      
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('contestant_id', c.id)
        .eq('status', 'success')
        .order('created_at', { ascending: false });
      
      if (!txError && tx) setTransactions(tx);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const filtered = transactions.filter(tx => 
    tx.voter_email.toLowerCase().includes(search.toLowerCase()) || 
    tx.reference.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Reference', 'Voter Email', 'Amount (NGN)', 'Votes', 'Date'];
    const rows = filtered.map(tx => [tx.reference, tx.voter_email, (tx.amount / 100).toFixed(2), tx.votes_credited, new Date(tx.created_at).toLocaleString()]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Voters_${id}.csv`;
    link.click();
  };

  if (loading) return <div className="p-10 font-bold text-center">Loading...</div>;

  if (!contestant) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center h-full">
        <div className="bg-gray-100 p-4 rounded-full mb-4"><Users size={32} className="text-gray-400" /></div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Contestant Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">This contestant may have been deleted or the ID is incorrect.</p>
        <Link href="/admin/voters" className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">← Back to Voters</Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Link href="/admin/voters" className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 mb-2">
            <ArrowLeft size={12}/> Back to Voters
          </Link>
          <h1 className="text-2xl font-black text-gray-900">{contestant?.stage_name || contestant?.full_name} Voters</h1>
          <p className="text-sm text-gray-500">{contestant?.contestant_id} • Total Voters: {transactions.length}</p>
        </div>
        <button onClick={exportCSV} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
          <Download size={16}/> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-4">
        <div className="p-3 border-b bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:border-black"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase">Voter</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase">Votes</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase text-right">Amount</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase">Date</th>
                <th className="p-4 font-bold text-gray-600 text-xs uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-4 font-semibold">{tx.voter_email}</td>
                  <td className="p-4"><span className="bg-black text-white px-2 py-1 rounded text-xs font-bold">+{tx.votes_credited}</span></td>
                  <td className="p-4 text-right font-black text-green-600">₦{(tx.amount / 100).toLocaleString()}</td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/voters/${id}/receipt/${tx.id}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end ml-auto">
                      <Receipt size={14}/> Receipt
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={32} className="text-gray-300 mb-2" />
                      <p className="text-gray-500 font-bold">No voters found.</p>
                      <p className="text-xs text-gray-400">This contestant has no votes yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
