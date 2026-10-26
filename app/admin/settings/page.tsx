'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key');
    
    if (data) setSettings(data);
    setLoading(false);
  };

  const toggleSetting = async (key: string, currentValue: boolean) => {
    setUpdating(key);
    
    const { error } = await supabase
      .from('settings')
      .update({ value: !currentValue, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) {
      alert('Failed to update setting: ' + error.message);
    } else {
      // Update local state to reflect change immediately
      setSettings(settings.map(s => s.key === key ? { ...s, value: !currentValue } : s));
    }
    setUpdating(null);
  };

  if (loading) return <div className="p-10 font-bold">Loading Settings...</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black">System Settings</h1>
        <p className="text-gray-500 mt-2">Master controls for the TFTC Live Show. Changes take effect immediately across the entire platform.</p>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="font-bold text-lg">Live Controls</h2>
          <p className="text-sm text-gray-500">These switches override the automated schedule in your brief.</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {settings.map((s) => (
            <div key={s.key} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold text-lg capitalize text-gray-900">
                  {s.key.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {s.description || 'Toggle this setting'}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Last updated: {new Date(s.updated_at).toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={() => toggleSetting(s.key, s.value)}
                disabled={updating === s.key}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${
                  s.value ? 'bg-green-500' : 'bg-gray-300'
                } ${updating === s.key ? 'opacity-50' : ''}`}
              >
                <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                  s.value ? 'translate-x-11' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
          {settings.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No settings found. Make sure you ran the SQL to create the settings table.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-2xl">
        <h3 className="font-bold text-blue-900 mb-2">How to use these controls:</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li><strong>Registration Open:</strong> Turn OFF to stop new contestants from applying. The public registration form will show a "Registration Closed" message.</li>
          <li><strong>Voting Open:</strong> Turn OFF to stop votes. The public voting pages will show "Voting Closed" and the Paystack buttons will be disabled.</li>
        </ul>
      </div>
    </div>
  );
}
