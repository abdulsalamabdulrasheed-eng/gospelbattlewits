'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // We will create a settings table in the next step
    const { data } = await supabase.from('settings').select('*');
    if (data) setSettings(data);
    setLoading(false);
  };

  const toggleSetting = async (key: string, currentValue: boolean) => {
    await supabase.from('settings').update({ value: !currentValue }).eq('key', key);
    fetchSettings();
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black mb-8">System Settings</h1>
      
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden divide-y">
        {settings.map((s) => (
          <div key={s.key} className="p-6 flex items-center justify-between">
            <div>
              <div className="font-bold text-lg capitalize">{s.key.replace('_', ' ')}</div>
              <div className="text-sm text-gray-500">
                {s.key === 'registration_open' ? 'Allow new contestants to apply.' : 'Allow the public to cast votes.'}
              </div>
            </div>
            <button
              onClick={() => toggleSetting(s.key, s.value)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                s.value ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                s.value ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
