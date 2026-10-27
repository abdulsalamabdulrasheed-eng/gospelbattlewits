'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Search, ShieldCheck, Download } from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(logs);
    } else {
      const lower = search.toLowerCase();
      setFiltered(logs.filter(l => 
        l.admin_email.toLowerCase().includes(lower) || 
        l.action.toLowerCase().includes(lower) ||
        (l.target && l.target.toLowerCase().includes(lower))
      ));
    }
  }, [search, logs]);

  const fetchLogs = async () => {
    const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Admin', 'Action', 'Target', 'Details', 'Date'];
    const rows = filtered.map(l => [
      l.admin_email, l.action, l.target, l.details, new Date(l.created_at).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">A permanent, unalterable record of every admin action.</p>
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
            placeholder="Search by admin, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-gray-100 rounded-lg shrink-0 mt-1">
                <ShieldCheck size={16} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-1">
                  <div className="text-sm font-bold text-gray-900">
                    {log.action.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{log.admin_email}</span> performed action on <span className="font-semibold text-gray-800">{log.target || 'N/A'}</span>
                </div>
                {log.details && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">No audit logs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
