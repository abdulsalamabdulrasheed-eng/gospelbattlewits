'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Megaphone, BarChart3, Settings, LogOut, BookOpen, ExternalLink, Home, Users } from 'lucide-react';

export default function ContestantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPasswordSet, setIsPasswordSet] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPassword = async () => {
      if (pathname === '/contestant/set-password') {
        setIsPasswordSet(true);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setIsPasswordSet(!!session);
    };
    checkPassword();
  }, [pathname]);

  if (isPasswordSet === null) return <div className="min-h-screen flex items-center justify-center font-bold">Verifying session...</div>;

  if (!isPasswordSet && pathname !== '/contestant/set-password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-black mb-2">Action Required</h1>
          <p className="text-gray-500 mb-6">You need to set a password before accessing your dashboard.</p>
          <Link href="/contestant/set-password" className="block w-full bg-black text-white font-bold py-3 rounded-lg">
            Set Password Now
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleBackToSite = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Overview', path: '/contestant/dashboard', icon: LayoutDashboard },
    { name: 'Campaign', path: '/contestant/campaign', icon: Megaphone },
    { name: 'Supporters', path: '/contestant/supporters', icon: Users },
    { name: 'Analytics', path: '/contestant/analytics', icon: BarChart3 },
    { name: 'Rules', path: '/contestant/rules', icon: BookOpen },
    { name: 'Settings', path: '/contestant/settings', icon: Settings },
  ];

  if (pathname === '/contestant/set-password') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-16 md:pb-0">
      <div className="md:hidden bg-black text-white p-3 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-sm uppercase tracking-wider">Campaign Center</div>
        <button onClick={handleBackToSite} className="text-xs bg-gray-800 px-3 py-1.5 rounded font-bold flex items-center gap-1">
          <Home size={12}/> Site
        </button>
      </div>

      <div className="hidden md:flex w-56 bg-black text-white flex-col sticky top-0 h-screen border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-base font-black tracking-wider uppercase">Campaign</h1>
          <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">TFTC 2027</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-xs transition-all ${
                  isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-black' : 'text-gray-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button onClick={handleBackToSite} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-blue-400 hover:bg-gray-800 rounded-lg transition">
            <ExternalLink size={16} /> Back to Site (Logout)
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:bg-gray-800 rounded-lg transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-black' : 'text-gray-400'}`}
            >
              <item.icon size={18} className={isActive ? 'text-black' : 'text-gray-400'} />
              <span className="text-[9px] font-bold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
