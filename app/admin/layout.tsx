'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Contestants', path: '/admin/contestants' },
    { name: 'Transactions', path: '/admin/transactions' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black text-white md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-wider uppercase">TFTC Admin</h1>
          <p className="text-xs text-gray-400 mt-1">God Mode</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 rounded-lg font-bold text-sm transition ${
                pathname === item.path ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-400 hover:bg-gray-800 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen">
        {children}
      </div>
    </div>
  );
}
