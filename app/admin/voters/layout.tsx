'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function VotersLayout({ children }: { children: React.ReactNode }) {
  const [contestants, setContestants] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchContestants = async () => {
      const { data } = await supabase
        .from('contestants')
        .select('id, contestant_id, full_name, stage_name')
        .eq('status', 'approved')
        .order('full_name');
      if (data) setContestants(data);
    };
    fetchContestants();
  }, []);

  return (
    <div className="flex h-full">
      {/* Sub-Sidebar */}
      <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Contestants</h2>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-black p-1 mx-auto">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contestants.map(c => (
            <Link
              key={c.id}
              href={`/admin/voters/${c.contestant_id}`}
              title={isCollapsed ? (c.stage_name || c.full_name) : ''}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold truncate transition ${
                pathname === `/admin/voters/${c.contestant_id}`
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${pathname === `/admin/voters/${c.contestant_id}` ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}>
                {isCollapsed ? (c.stage_name?.[0] || c.full_name[0]) : <User size={12} />}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{c.stage_name || c.full_name}</span>
                  <span className="text-[10px] opacity-60 font-mono">{c.contestant_id}</span>
                </div>
              )}
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
