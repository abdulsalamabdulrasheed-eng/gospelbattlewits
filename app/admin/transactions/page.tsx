'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Search, Download, TrendingUp, Filter, Wallet, CreditCard, Receipt } from 'lucide-react';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;
    if (activeTab === 'registrations') result = result.filter(tx => tx.votes_credited === 0);
    else if (activeTab === 'votes') result = result.filter(tx => tx.votes_credited > 0);

    if (search.trim() !== '') {
      const lower = search.toLowerCase();
      result = result.filter(tx => 
        tx.reference.toLowerCase().includes(lower) || 
        tx.voter_email.toLowerCase().includes(lower)
      );
    }

    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === 'highest') result = [...result].sort((a, b) => b.amount - a.amount);

    setFiltered(result);
  }, [search, transactions, activeTab, sortBy]);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`*, contestants ( contestant_id, full_name, stage_name )`)
      .eq('status', 'success')
      .order('created_at', { ascending: false });
    
    if (data) {
      setTransactions(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
  const votingRevenue = transactions.filter(t => t.votes_credited > 0).reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
  const registrationRevenue = transactions.filter(t => t.votes_credited === 0).reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
  const totalVotes = transactions.reduce((sum, t) => sum + (t.votes_credited || 0), 0);

  const exportToCSV = () => {
    const headers = ['Reference', 'Voter Email', 'Votes Credited', 'Amount (NGN)', 'Date'];
    const rows = filtered.map(tx => [tx.reference, tx.voter_email, tx.votes_credited, (tx.amount / 100).toFixed(2), new Date(tx.created_at).toLocaleString()]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TFTC_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Transaction Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time financial audit of all successful payments.</p>
        </div>
        <button onClick={exportToCSV} className="bg-white border border-gray-300 text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1"><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gross Revenue</div><TrendingUp size={16} className="text-green-600" /></div>
          <div className="text-2xl md:text-3xl font-black text-green-600 truncate">₦{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1"><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Voting Revenue</div><Wallet size={16} className="text-blue-600" /></div>
          <div className="text-2xl md:text-3xl font-black text-blue-600 truncate">₦{votingRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 font-bold mt-1">{totalVotes.toLocaleString()} votes generated</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1"><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registration Revenue</div><CreditCard size={16} className="text-purple-600" /></div>
          <div className="text-2xl md:text-3xl font-black text-purple-600 truncate">₦{registrationRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 font-bold mt-1">{transactions.filter(t => t.votes_credited === 0).length} registrations</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[{ id: 'all', label: 'All' }, { id: 'registrations', label: 'Registrations' }, { id: 'votes', label: 'Votes' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by email or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black bg-white">
            <option value="newest">Newest First</option>
            <option value="highest">Highest Amount</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Reference</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Voter Email</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Type</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Amount (₦)</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Date</th>
              <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((tx) => {
              const receiptUrl = tx.contestants?.contestant_id ? `/admin/voters/${tx.contestants.contestant_id}/receipt/${tx.id}` : null;
              return (
                <tr key={tx.id} onClick={() => receiptUrl && router.push(receiptUrl)} className={`hover:bg-blue-50/50 transition-colors ${receiptUrl ? 'cursor-pointer group' : ''}`}>
                  <td className="p-4 font-mono text-xs text-gray-500">{tx.reference}</td>
                  <td className="p-4 font-semibold text-gray-900">{tx.voter_email}</td>
                  <td className="p-4">
                    {tx.votes_credited > 0 ? (
                      <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold border border-yellow-100">+{tx.votes_credited} Votes</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold border border-gray-200">Registration</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-black text-green-600">₦{(tx.amount / 100).toLocaleString()}</td>
                  <td className="p-4 text-gray-500 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    {receiptUrl ? (
                      <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1 justify-end ml-auto"><Receipt size={14}/> View</span>
                    ) : <span className="text-xs text-gray-400">N/A</span>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-gray-500">No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
