'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Search, FileText, Download, CheckCircle2 } from 'lucide-react';

export default function ConsentRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(records);
    } else {
      const lower = search.toLowerCase();
      setFiltered(records.filter(r => 
        r.full_name.toLowerCase().includes(lower) || 
        r.email.toLowerCase().includes(lower) ||
        r.contestant_id.toLowerCase().includes(lower)
      ));
    }
  }, [search, records]);

  const fetchRecords = async () => {
    const { data } = await supabase.from('contestants').select('id, contestant_id, full_name, email, created_at, status').order('created_at', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Agreement Date', 'Status'];
    const rows = filtered.map(r => [
      r.contestant_id, r.full_name, r.email, new Date(r.created_at).toLocaleString(), r.status
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

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Consent Records</h1>
          <p className="text-sm text-gray-500 mt-1">Legal proof of every contestant who agreed to the Content & Media Agreement.</p>
        </div>
        <button onClick={exportCSV} className="bg-white border border-gray-300 text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center gap-2 shadow-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{r.full_name}</div>
                  <div className="text-xs text-gray-500">{r.email} · {r.contestant_id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900">Agreed On</div>
                <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">No consent records found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
