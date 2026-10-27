'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function ConsentRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase
      .from('contestants')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false });
    
    if (data) setRecords(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Agreement Date'];
    const rows = records.map(r => [
      r.full_name,
      r.email,
      new Date(r.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Consent_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Consent Records</h1>
        <button onClick={exportCSV} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">⬇ Export CSV</button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Name</th>
              <th className="p-4 font-bold text-gray-600">Email</th>
              <th className="p-4 font-bold text-gray-600">Agreement Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold">{r.full_name}</td>
                <td className="p-4">{r.email}</td>
                <td className="p-4 text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
