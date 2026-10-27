'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLogs(data);
    setLoading(false);
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Audit Log</h1>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600">Admin</th>
              <th className="p-4 font-bold text-gray-600">Action</th>
              <th className="p-4 font-bold text-gray-600">Target</th>
              <th className="p-4 font-bold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold">{log.admin_email}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4">{log.target}</td>
                <td className="p-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No admin actions logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
