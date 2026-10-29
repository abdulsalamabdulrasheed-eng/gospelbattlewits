'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export default function VotersLayout({ children }: { children: React.ReactNode }) {
  const [contestants, setContestants] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchContestants = async () => {
      const { data } = await supabase.from('contestants').select('id, contestant_id, full_name, stage_name').eq('status', 'approved').order('full_name');
      if (data) setContestants(data);
    };
    fetchContestants();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sub-Sidebar for Contestants */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0 overflow-y-auto">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Filter by Contestant</h2>
        <div className="space-y-1">
          {contestants.map(c => (
            <Link
              key={c.id}
              href={`/admin/voters/${c.contestant_id}`}
              className={`block px-3 py-2 rounded-lg text-xs font-bold truncate transition ${
                pathname === `/admin/voters/${c.contestant_id}` 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.stage_name || c.full_name} <span className="opacity-60 text-[10px] ml-1">{c.contestant_id}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
