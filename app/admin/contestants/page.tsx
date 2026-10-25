'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function ManageContestants() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestants();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchContestants, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchContestants = async () => {
    const { data } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    if (data) setContestants(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('contestants').update({ status }).eq('id', id);
    fetchContestants(); // Refresh immediately after click
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Manage Contestants</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contestants.map(c => (
          <div key={c.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Video & Photo */}
            <div className="flex h-48 bg-gray-900">
              <video src={c.video_url} controls className="w-1/2 object-cover border-r border-gray-800" />
              <img src={c.photo_url} alt="Profile" className="w-1/2 object-cover" />
            </div>
            
            {/* Details */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-black">{c.stage_name || c.full_name}</h2>
                  <p className="text-sm text-gray-500">{c.contestant_id} · {c.church}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  c.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  c.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  c.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                  'bg-gray-200 text-gray-700'
                }`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-1">{c.bio}</p>
              
              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-4 border-t">
                {c.status !== 'approved' && (
                  <button onClick={() => updateStatus(c.id, 'approved')} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Approve</button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => updateStatus(c.id, 'rejected')} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm">Reject</button>
                )}
                {c.status === 'approved' && (
                  <button onClick={() => updateStatus(c.id, 'disqualified')} className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold text-sm">Disqualify</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
