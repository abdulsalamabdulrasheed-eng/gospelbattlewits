'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, CreditCard, ShieldCheck, 
  Settings, LogOut, Menu, X, FileText, ChevronLeft, ChevronRight, BookOpen, ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navGroups = [
    {
      title: 'Command Center',
      items: [{ name: 'Dashboard', path: '/admin', icon: LayoutDashboard }]
    },
    {
      title: 'Voting Operations',
      items: [
        { name: 'Contestants', path: '/admin/contestants', icon: Users },
        { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
      ]
    },
    {
      title: 'Content',
      items: [{ name: 'Rules & Guidelines', path: '/admin/rules', icon: BookOpen }]
    },
    {
      title: 'Security & Audit',
      items: [
        { name: 'Consent Records', path: '/admin/consent', icon: FileText },
        { name: 'Audit Log', path: '/admin/audit', icon: ShieldCheck },
      ]
    },
    {
      title: 'System',
      items: [{ name: 'Settings', path: '/admin/settings', icon: Settings }]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0A0A0A] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white text-black p-1 rounded font-black text-xs">GB</div>
          <h1 className="text-sm font-black tracking-wider uppercase">TFTC Admin</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: isCollapsed ? 72 : 256 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-64 bg-[#0A0A0A] text-white md:min-h-screen flex flex-col fixed md:relative z-40 top-0 h-full md:h-auto pt-16 md:pt-0 border-r border-gray-800 overflow-hidden"
          >
            <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="bg-white text-black p-1.5 rounded-md font-black text-sm shrink-0">GB</div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-sm font-black tracking-wider uppercase leading-none whitespace-nowrap">TFTC Admin</h1>
                    <p className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-widest">God Mode</p>
                  </div>
                )}
              </div>
              <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-white transition p-1">
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <nav className="flex-1 p-2 space-y-4 mt-2 overflow-y-auto overflow-x-hidden">
              {navGroups.map((group) => (
                <div key={group.title}>
                  {!isCollapsed && (
                    <h3 className="px-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 whitespace-nowrap">{group.title}</h3>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                            isActive ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <item.icon size={16} className={isActive ? 'text-black' : 'text-gray-500 shrink-0'} />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-2 border-t border-gray-800 pb-20 md:pb-2 space-y-1">
              {/* Back to Site Link */}
              <Link
                href="/"
                className="flex items-center gap-3 px-2.5 py-2.5 text-xs font-bold text-blue-400 hover:bg-gray-800 rounded-lg transition"
              >
                <ExternalLink size={16} className="shrink-0" />
                {!isCollapsed && <span>Back to Site</span>}
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-2.5 py-2.5 text-xs font-bold text-red-400 hover:bg-gray-800 rounded-lg transition"
              >
                <LogOut size={16} className="shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen w-full">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
