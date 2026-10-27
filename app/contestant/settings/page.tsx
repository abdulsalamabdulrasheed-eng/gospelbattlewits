'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, LogOut, CheckCircle2, Lock, Edit2, X } from 'lucide-react';

export default function ContestantSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phone: '' });
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('contestants').select('*').eq('email', user.email).single();
      if (data) {
        setProfile(data);
        setEditForm({ email: data.email, phone: data.phone });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const saveContactInfo = async () => {
    await supabase.from('contestants').update({ 
      email: editForm.email, 
      phone: editForm.phone,
      email_verified: false,
      phone_verified: false
    }).eq('id', profile.id);
    
    setProfile({ ...profile, email: editForm.email, phone: editForm.phone, email_verified: false, phone_verified: false });
    setIsEditing(false);
    alert("Contact info updated. Please re-verify your new details on the dashboard.");
  };

  const changePassword = async () => {
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert("Password updated successfully.");
      setShowPasswordModal(false);
      setNewPassword('');
    }
  };

  if (loading) return <div className="p-6 text-sm font-bold text-gray-500">Loading...</div>;

  const isVerified = profile?.email_verified === true && profile?.phone_verified === true;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your account and security.</p>
      </div>

      {/* Public Profile (Read Only) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <User size={16} className="text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">Public Profile</h2>
        </div>
        <div className="p-4 flex items-center gap-4">
          <img src={profile.photo_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2" />
          <div>
            <div className="text-sm font-black text-gray-900">{profile.stage_name || profile.full_name}</div>
            <div className="text-xs text-gray-500">{profile.contestant_id} · {profile.church}</div>
            <div className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1"><Lock size={10}/> Public data is locked. Contact admin to edit.</div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">Contact Info</h2>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"><Edit2 size={12}/> Edit</button>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          {isEditing ? (
            <div className="space-y-3">
              <div><label className="block text-xs font-bold mb-1">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" /></div>
              <div><label className="block text-xs font-bold mb-1">Phone</label><input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" /></div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-black font-bold py-2 rounded-lg text-xs">Cancel</button>
                <button onClick={saveContactInfo} className="flex-1 bg-black text-white font-bold py-2 rounded-lg text-xs">Save Changes</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-bold truncate"><Mail size={14}/> {profile.email}</div>
                {profile.email_verified ? <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span> : <span className="text-orange-500 text-[10px] font-bold">Unverified</span>}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-bold truncate"><Phone size={14}/> {profile.phone}</div>
                {profile.phone_verified ? <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span> : <span className="text-orange-500 text-[10px] font-bold">Unverified</span>}
              </div>
              {!isVerified && <p className="text-[10px] text-orange-600 font-bold bg-orange-50 p-2 rounded border border-orange-100">Please verify your new contact info on the Dashboard to unlock campaign tools.</p>}
            </>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Shield size={16} className="text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">Security</h2>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-900">Password</div>
            <div className="text-xs text-gray-500">Change your login password.</div>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="bg-gray-100 border text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-200">Change</button>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition">
        <LogOut size={16}/> Logout
      </button>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}><X size={20}/></button>
            </div>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password (min 6 chars)" className="w-full p-3 border rounded-lg mb-4 text-sm" />
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg text-sm">Cancel</button>
              <button onClick={changePassword} className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-sm">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
