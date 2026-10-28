'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { logAdminAction } from '@/utils/audit';
import { ShieldAlert, Power, Activity, Wrench, Lock } from 'lucide-react';
import { useModal } from '@/utils/useModal';
import Link from 'next/link';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    registration_open: true,
    voting_open: true,
    ip_tracking: true,
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const { modal, showModal, hideModal } = useModal();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const newSettings: Record<string, boolean> = {};
      data.forEach(s => { newSettings[s.key] = s.value; });
      setSettings({ ...settings, ...newSettings });
    }
    setLoading(false);
  };

  const toggleSetting = async (key: string, currentValue: boolean) => {
    const { error } = await supabase.from('settings').update({ value: !currentValue, updated_at: new Date().toISOString() }).eq('key', key);
    if (error) return showModal({ title: 'Error', message: error.message, isDanger: true, showCancel: false });
    
    await logAdminAction('toggle_setting', key, `Admin set ${key} to ${!currentValue}`);
    
    setSettings({ ...settings, [key]: !currentValue });
  };

  const resetLeaderboard = () => {
    showModal({
      title: 'Reset Leaderboard?',
      message: 'This will set ALL contestant votes to 0. This cannot be undone.',
      isDanger: true,
      confirmText: 'Yes, Reset Everything',
      onConfirm: async () => {
        await supabase.from('contestants').update({ total_votes: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        await logAdminAction('reset_leaderboard', 'ALL', 'Admin reset all votes to zero');
        hideModal();
        showModal({ title: 'Success', message: 'Leaderboard has been reset.', showCancel: false, onConfirm: hideModal });
      }
    });
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Master controls for the TFTC Live Show.</p>
      </div>

      <div className="space-y-6">
        {/* Security & 2FA */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Lock size={18} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">Admin Security</h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Two-Factor Authentication (2FA)</div>
              <div className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your admin account.</div>
            </div>
            <Link href="/admin/setup-2fa" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-800 transition">Setup 2FA</Link>
          </div>
        </div>

        {/* Live Controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Activity size={18} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">Live Controls</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Registration Open</div>
                <div className="text-xs text-gray-500 mt-0.5">Allow new contestants to register.</div>
              </div>
              <button onClick={() => toggleSetting('registration_open', settings.registration_open)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.registration_open ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.registration_open ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Voting Open</div>
                <div className="text-xs text-gray-500 mt-0.5">Allow the public to cast votes.</div>
              </div>
              <button onClick={() => toggleSetting('voting_open', settings.voting_open)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.voting_open ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.voting_open ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <ShieldAlert size={18} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">Security & Anti-Fraud</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">IP Tracking</div>
                <div className="text-xs text-gray-500 mt-0.5">Flag high-volume voting IPs for review.</div>
              </div>
              <button onClick={() => toggleSetting('ip_tracking', settings.ip_tracking)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.ip_tracking ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.ip_tracking ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Wrench size={18} className="text-gray-700" />
            <h2 className="text-sm font-bold text-gray-900">System</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-900">Maintenance Mode</div>
                <div className="text-xs text-gray-500 mt-0.5">Put the entire site into maintenance mode.</div>
              </div>
              <button onClick={() => toggleSetting('maintenance_mode', settings.maintenance_mode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-200 flex items-center gap-2">
            <Power size={18} className="text-red-600" />
            <h2 className="text-sm font-bold text-red-700">Danger Zone</h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-red-900">Reset Leaderboard</div>
              <div className="text-xs text-red-600 mt-0.5">Wipe all votes back to zero. This cannot be undone.</div>
            </div>
            <button onClick={resetLeaderboard} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-700 transition">Reset Votes</button>
          </div>
        </div>
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`p-4 text-center ${modal.isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-black ${modal.isDanger ? 'text-red-700' : 'text-green-700'}`}>{modal.title}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">{modal.message}</p>
              <div className="flex gap-2">
                {modal.showCancel && <button onClick={hideModal} className="flex-1 bg-gray-200 text-black font-bold py-2.5 rounded-lg">Cancel</button>}
                <button onClick={modal.onConfirm} className={`flex-1 text-white font-bold py-2.5 rounded-lg ${modal.isDanger ? 'bg-red-600' : 'bg-black'}`}>{modal.confirmText}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
