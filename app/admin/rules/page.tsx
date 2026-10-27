'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function AdminRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase.from('rules').select('*').order('order_index');
    if (data) setRules(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, title: string, content: string) => {
    await supabase.from('rules').update({ title, content }).eq('id', id);
    alert('Rule updated successfully.');
  };

  const handleAdd = async () => {
    await supabase.from('rules').insert({ title: 'New Rule', content: 'Enter rule details here...', order_index: rules.length + 1 });
    fetchRules();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    await supabase.from('rules').delete().eq('id', id);
    fetchRules();
  };

  if (loading) return <div className="p-10 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Rules & Guidelines</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the legal and operational rules shown to contestants.</p>
        </div>
        <button onClick={handleAdd} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Add Rule</button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <input type="text" defaultValue={rule.title} onChange={(e) => rule.title = e.target.value} className="font-bold text-sm text-gray-900 w-full border-b pb-1 focus:outline-none focus:border-black" />
              <button onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
            </div>
            <textarea defaultValue={rule.content} onChange={(e) => rule.content = e.target.value} rows={3} className="w-full text-sm text-gray-600 p-2 border rounded-lg focus:outline-none focus:border-black mb-2" />
            <div className="text-right">
              <button onClick={() => handleUpdate(rule.id, rule.title, rule.content)} className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"><Save size={12}/> Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
