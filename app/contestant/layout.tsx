'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { LayoutDashboard, Megaphone, BarChart3, Settings, LogOut } from 'lucide-react';

export default function ContestantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Overview', path: '/contestant/dashboard', icon: LayoutDashboard },
    { name: 'My Campaign', path: '/contestant/campaign', icon: Megaphone },
    { name: 'Analytics', path: '/contestant/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/contestant/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-black text-white flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-wider uppercase">Campaign Center</h1>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">TFTC 2027</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-black' : 'text-gray-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-gray-800 rounded-lg transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-black' : 'text-gray-400'} />
              <span className="text-[10px] font-bold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
