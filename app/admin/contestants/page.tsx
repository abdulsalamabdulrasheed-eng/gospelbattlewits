'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { logAdminAction } from '@/utils/audit';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Video, FileText, CheckCircle, Trash2, Edit3, UserX } from 'lucide-react';

export default function ManageContestants() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected
  
  // Side Drawer State
  const [selectedContestant, setSelectedContestant] = useState<any>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ stage_name: '', church: '', bio: '' });

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean; title: string; message: string; action: () => void; isDanger: boolean;
  }>({ show: false, title: '', message: '', action: () => {}, isDanger: false });

  useEffect(() => {
    fetchContestants();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = contestants;

    // 1. Filter by Tab
    if (activeTab !== 'all') {
      result = result.filter(c => c.status === activeTab);
    }

    // 2. Filter by Search
    if (search.trim() !== '') {
      const lower = search.toLowerCase();
      result = result.filter(c => 
        c.full_name.toLowerCase().includes(lower) || 
        (c.stage_name && c.stage_name.toLowerCase().includes(lower)) ||
        c.contestant_id.toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  }, [search, contestants, activeTab]);

  const fetchContestants = async () => {
    const { data } = await supabase.from('contestants').select('*').order('created_at', { ascending: false });
    if (data) setContestants(data);
    setLoading(false);
  };

  const askConfirmation = (title: string, message: string, action: () => void, isDanger = false) => {
    setConfirmModal({ show: true, title, message, action, isDanger });
  };

  const updateStatus = async (id: string, status: string, name: string, contestantId: string) => {
    askConfirmation(
      `Confirm Action`,
      `Are you sure you want to set ${name} to ${status.toUpperCase()}?`,
      async () => {
        await supabase.from('contestants').update({ status }).eq('id', id);
        await logAdminAction(status, `${name} (${contestantId})`, `Admin set status to ${status}`);
        fetchContestants();
        setConfirmModal({ ...confirmModal, show: false });
        if (selectedContestant?.id === id) setSelectedContestant({ ...selectedContestant, status });
      },
      status === 'rejected' || status === 'disqualified'
    );
  };

  const deleteContestant = async (id: string, name: string, contestantId: string) => {
    askConfirmation(
      `Delete Contestant`,
      `WARNING: This will permanently delete ${name}. This cannot be undone. Proceed?`,
      async () => {
        await supabase.from('contestants').delete().eq('id', id);
        await logAdminAction('delete', `${name} (${contestantId})`, `Admin deleted the contestant`);
        fetchContestants();
        setConfirmModal({ ...confirmModal, show: false });
        setSelectedContestant(null);
      },
      true
    );
  };

  const startEdit = () => {
    setEditForm({ stage_name: selectedContestant.stage_name || '', church: selectedContestant.church, bio: selectedContestant.bio });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    await supabase.from('contestants').update({
      stage_name: editForm.stage_name, church: editForm.church, bio: editForm.bio,
    }).eq('id', selectedContestant.id);

    await logAdminAction('edit', `${selectedContestant.full_name} (${selectedContestant.contestant_id})`, 'Admin updated profile details');
    
    setSelectedContestant({ ...selectedContestant, ...editForm });
    setIsEditing(false);
    fetchContestants();
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'disqualified', label: 'Disqualified' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto relative h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Contestant Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all applications, approvals, and disqualifications.</p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Contestant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <div 
            key={c.id} 
            onClick={() => setSelectedContestant(c)}
            className="bg-white border rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex h-36 bg-gray-100 relative">
              {c.video_url ? <video src={c.video_url} className="w-1/2 object-cover border-r border-gray-200" /> : <div className="w-1/2 flex items-center justify-center text-gray-400 text-xs">No Video</div>}
              {c.photo_url ? <img src={c.photo_url} alt="Profile" className="w-1/2 object-cover" /> : <div className="w-1/2 flex items-center justify-center text-gray-400 text-xs">No Photo</div>}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold shadow-sm ${
                  c.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  c.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  c.status === 'disqualified' ? 'bg-gray-800 text-white' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-sm font-black text-gray-900 truncate">{c.stage_name || c.full_name}</h2>
              <p className="text-xs text-gray-500 truncate">{c.contestant_id} · {c.church}</p>
              <div className="mt-3 text-xs font-bold text-gray-700">{c.total_votes.toLocaleString()} votes</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full p-10 text-center text-gray-500 bg-white rounded-xl border border-dashed">
            No contestants found in this category.
          </div>
        )}
      </div>

      {/* SIDE DRAWER FOR DETAILS */}
      <AnimatePresence>
        {selectedContestant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => { setSelectedContestant(null); setIsEditing(false); }}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-sm font-black text-gray-900">Contestant Details</h2>
                <button onClick={() => { setSelectedContestant(null); setIsEditing(false); }} className="p-1 hover:bg-gray-200 rounded">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Media */}
                <div className="flex gap-2 h-48 mb-6 bg-gray-100 rounded-lg overflow-hidden border">
                  {selectedContestant.video_url ? <video src={selectedContestant.video_url} controls className="w-1/2 object-cover bg-black" /> : <div className="w-1/2 flex items-center justify-center text-xs text-gray-500">No Video</div>}
                  {selectedContestant.photo_url ? <img src={selectedContestant.photo_url} alt="Profile" className="w-1/2 object-cover" /> : <div className="w-1/2 flex items-center justify-center text-xs text-gray-500">No Photo</div>}
                </div>

                {/* Info */}
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black">{selectedContestant.stage_name || selectedContestant.full_name}</h3>
                      <p className="text-sm text-gray-500">{selectedContestant.contestant_id} · {selectedContestant.category}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y">
                      <div><div className="text-xs text-gray-500 font-bold uppercase">Church</div><div className="text-sm font-semibold">{selectedContestant.church}</div></div>
                      <div><div className="text-xs text-gray-500 font-bold uppercase">Votes</div><div className="text-sm font-black text-green-600">{selectedContestant.total_votes.toLocaleString()}</div></div>
                      <div><div className="text-xs text-gray-500 font-bold uppercase">Email</div><div className="text-sm font-semibold truncate">{selectedContestant.email}</div></div>
                      <div><div className="text-xs text-gray-500 font-bold uppercase">Phone</div><div className="text-sm font-semibold">{selectedContestant.phone}</div></div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Bio</div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{selectedContestant.bio}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Stage Name</label><input type="text" value={editForm.stage_name} onChange={e => setEditForm({...editForm, stage_name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Church</label><input type="text" value={editForm.church} onChange={e => setEditForm({...editForm, church: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Bio</label><textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} className="w-full p-2 border rounded-lg text-sm"></textarea></div>
                  </div>
                )}
              </div>

              {/* Drawer Actions */}
              <div className="p-4 border-t bg-gray-50 space-y-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-white border text-black font-bold py-2.5 rounded-lg text-sm">Cancel</button>
                    <button onClick={saveEdit} className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-sm">Save Changes</button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      {selectedContestant.status !== 'approved' && (
                        <button onClick={() => updateStatus(selectedContestant.id, 'approved', selectedContestant.full_name, selectedContestant.contestant_id)} className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1"><CheckCircle size={16}/> Approve</button>
                      )}
                      {selectedContestant.status !== 'rejected' && (
                        <button onClick={() => updateStatus(selectedContestant.id, 'rejected', selectedContestant.full_name, selectedContestant.contestant_id)} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1"><UserX size={16}/> Reject</button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={startEdit} className="flex-1 bg-white border border-gray-300 text-black font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1"><Edit3 size={16}/> Edit</button>
                      <button onClick={() => deleteContestant(selectedContestant.id, selectedContestant.full_name, selectedContestant.contestant_id)} className="flex-1 bg-white border border-red-200 text-red-600 font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1"><Trash2 size={16}/> Delete</button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-4 text-center ${confirmModal.isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-black ${confirmModal.isDanger ? 'text-red-700' : 'text-green-700'}`}>{confirmModal.title}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">{confirmModal.message}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg">Cancel</button>
                <button onClick={confirmModal.action} className={`flex-1 text-white font-bold py-2.5 rounded-lg ${confirmModal.isDanger ? 'bg-red-600' : 'bg-black'}`}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
