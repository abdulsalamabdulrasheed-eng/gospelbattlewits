'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { logAdminAction } from '@/utils/audit';

export default function ManageContestants() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit Modal State
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ stage_name: '', church: '', bio: '' });

  useEffect(() => {
    fetchContestants();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(contestants);
    } else {
      const lower = search.toLowerCase();
      setFiltered(contestants.filter(c => 
        c.full_name.toLowerCase().includes(lower) || 
        (c.stage_name && c.stage_name.toLowerCase().includes(lower)) ||
        c.contestant_id.toLowerCase().includes(lower)
      ));
    }
  }, [search, contestants]);

  const fetchContestants = async () => {
    const { data } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    if (data) setContestants(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, name: string, contestantId: string) => {
    if (!confirm(`Are you sure you want to set ${name} to ${status.toUpperCase()}?`)) return;
    
    await supabase.from('contestants').update({ status }).eq('id', id);
    await logAdminAction(status, `${name} (${contestantId})`, `Admin set status to ${status}`);
    fetchContestants();
  };

  const deleteContestant = async (id: string, name: string, contestantId: string) => {
    if (!confirm(`WARNING: This will permanently delete ${name}. This cannot be undone. Proceed?`)) return;
    
    await supabase.from('contestants').delete().eq('id', id);
    await logAdminAction('delete', `${name} (${contestantId})`, `Admin deleted the contestant`);
    fetchContestants();
  };

  const openEdit = (contestant: any) => {
    setEditing(contestant);
    setEditForm({ stage_name: contestant.stage_name || '', church: contestant.church, bio: contestant.bio });
  };

  const saveEdit = async () => {
    if (!editing) return;
    
    await supabase.from('contestants').update({
      stage_name: editForm.stage_name,
      church: editForm.church,
      bio: editForm.bio,
    }).eq('id', editing.id);

    await logAdminAction('edit', `${editing.full_name} (${editing.contestant_id})`, 'Admin updated profile details');
    
    setEditing(null);
    fetchContestants();
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Manage Contestants</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl shadow-sm outline-none focus:border-black"
        />
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-4">Edit {editing.full_name}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold mb-1">Stage Name</label><input type="text" value={editForm.stage_name} onChange={e => setEditForm({...editForm, stage_name: e.target.value})} className="w-full p-3 border rounded-lg" /></div>
              <div><label className="block text-sm font-bold mb-1">Church</label><input type="text" value={editForm.church} onChange={e => setEditForm({...editForm, church: e.target.value})} className="w-full p-3 border rounded-lg" /></div>
              <div><label className="block text-sm font-bold mb-1">Bio</label><textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={3} className="w-full p-3 border rounded-lg"></textarea></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 bg-gray-200 text-black font-bold py-3 rounded-lg">Cancel</button>
              <button onClick={saveEdit} className="flex-1 bg-black text-white font-bold py-3 rounded-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Contestant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex h-40 bg-gray-900">
              {c.video_url ? <video src={c.video_url} className="w-1/2 object-cover border-r border-gray-800" /> : <div className="w-1/2 flex items-center justify-center text-white text-xs">No Video</div>}
              {c.photo_url ? <img src={c.photo_url} alt="Profile" className="w-1/2 object-cover" /> : <div className="w-1/2 flex items-center justify-center text-white text-xs">No Photo</div>}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-black leading-tight">{c.stage_name || c.full_name}</h2>
                  <p className="text-xs text-gray-500">{c.contestant_id} · {c.church}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  c.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  c.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  c.status === 'disqualified' ? 'bg-gray-800 text-white' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              
              <div className="text-sm font-bold text-gray-700 mb-4">{c.total_votes.toLocaleString()} votes</div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t">
                {c.status !== 'approved' && (
                  <button onClick={() => updateStatus(c.id, 'approved', c.full_name, c.contestant_id)} className="bg-green-600 text-white py-2 rounded-lg font-bold text-xs">Approve</button>
                )}
                {c.status !== 'rejected' && (
                  <button onClick={() => updateStatus(c.id, 'rejected', c.full_name, c.contestant_id)} className="bg-red-600 text-white py-2 rounded-lg font-bold text-xs">Reject</button>
                )}
                {c.status === 'approved' && (
                  <button onClick={() => updateStatus(c.id, 'disqualified', c.full_name, c.contestant_id)} className="bg-gray-800 text-white py-2 rounded-lg font-bold text-xs">Disqualify</button>
                )}
                <button onClick={() => openEdit(c)} className="bg-gray-100 text-black py-2 rounded-lg font-bold text-xs border">Edit</button>
                <button onClick={() => deleteContestant(c.id, c.full_name, c.contestant_id)} className="bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs border border-red-200">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full p-10 text-center text-gray-500">No contestants found.</div>}
      </div>
    </div>
  );
}
