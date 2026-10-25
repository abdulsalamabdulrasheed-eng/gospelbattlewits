'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Contestants', path: '/admin/contestants' },
    { name: 'Transactions', path: '/admin/transactions' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg font-black tracking-wider uppercase">TFTC Admin</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Sidebar (Hidden on mobile unless toggled) */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-black text-white md:min-h-screen flex flex-col fixed md:relative z-40 top-0 h-full md:h-auto pt-16 md:pt-0`}>
        <div className="hidden md:block p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-wider uppercase">TFTC Admin</h1>
          <p className="text-xs text-gray-400 mt-1">God Mode</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`block px-4 py-3 rounded-lg font-bold text-sm transition ${
                pathname === item.path ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 pb-20 md:pb-4">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-400 hover:bg-gray-800 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>

      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen w-full">
        {children}
      </div>
    </div>
  );
}
