'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
    setLoading(false);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black">Transaction Ledger</h1>
          <p className="text-gray-500 mt-1">All successful Paystack payments</p>
        </div>
        <div className="text-left md:text-right bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none">
          <div className="text-sm font-bold text-gray-500 uppercase">Total Collected</div>
          <div className="text-3xl font-black text-green-600">₦{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Reference</th>
              <th className="p-4 font-bold text-gray-600">Voter Email</th>
              <th className="p-4 font-bold text-gray-600">Votes Credited</th>
              <th className="p-4 font-bold text-gray-600 text-right">Amount (₦)</th>
              <th className="p-4 font-bold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{tx.reference}</td>
                <td className="p-4 font-semibold">{tx.voter_email}</td>
                <td className="p-4">
                  <span className="bg-black text-white px-2 py-1 rounded-md text-xs font-bold">
                    +{tx.votes_credited}
                  </span>
                </td>
                <td className="p-4 text-right font-black text-green-600">₦{(tx.amount / 100).toLocaleString()}</td>
                <td className="p-4 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
