'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { ChevronDown, BookOpen } from 'lucide-react';

export default function ContestantRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchRules = async () => {
      const { data } = await supabase.from('rules').select('*').order('order_index');
      if (data) setRules(data);
      setLoading(false);
    };
    fetchRules();
  }, []);

  if (loading) return <div className="p-6 text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-black text-white rounded-lg"><BookOpen size={20}/></div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Rules & Guidelines</h1>
          <p className="text-xs text-gray-500">Read carefully to avoid disqualification.</p>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={rule.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center p-4 text-left font-bold text-sm text-gray-900 bg-white hover:bg-gray-50 transition"
            >
              {rule.title}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-100 bg-gray-50">
                {rule.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
