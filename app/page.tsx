'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';
import { Crown, Trophy, Users, Star, Share2, Mail, LogIn } from 'lucide-react';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  total_votes: number;
  photo_url: string;
  created_at: string;
}

export default function Home() {
  const [top3, setTop3] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop3 = async () => {
      const { data } = await supabase
        .from('contestants')
        .select('*')
        .eq('status', 'approved')
        .order('total_votes', { ascending: false })
        .order('created_at', { ascending: true }) // Tie-breaker
        .limit(3);
      if (data) setTop3(data);
      setLoading(false);
    };
    fetchTop3();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      
      {/* HEADER */}
      <nav className="bg-black/80 backdrop-blur-md text-white p-4 sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo size={32} showText={true} />
            <span className="font-black text-sm tracking-wider uppercase">TFTC 2027</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-xs font-bold">
            <Link href="/leaderboard" className="text-gray-300 hover:text-white hidden md:block">Leaderboard</Link>
            <Link href="/login" className="flex items-center gap-1 text-gray-300 hover:text-white">
              <LogIn size={14} /> Login
            </Link>
            <Link href="/register" className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.15),transparent_50%)] z-0"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-widest">Season 1 • 2027</div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">VOTE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">FAVOURITE</span></h1>
            <p className="text-gray-400 max-w-xl mx-auto mb-10 text-sm md:text-base">The top 20 contestants with the highest votes will battle live on stage for the grand prize.</p>
            
            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-2xl mx-auto mb-10">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <Trophy size={20} className="text-yellow-500 mx-auto mb-2" />
                <div className="text-lg md:text-2xl font-black">₦500k</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">1st Prize</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <Trophy size={20} className="text-gray-300 mx-auto mb-2" />
                <div className="text-lg md:text-2xl font-black">₦300k</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">2nd Prize</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <Trophy size={20} className="text-amber-600 mx-auto mb-2" />
                <div className="text-lg md:text-2xl font-black">₦100k</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">3rd Prize</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/leaderboard" className="bg-yellow-500 text-black font-black py-4 px-8 rounded-full hover:bg-yellow-400 transition shadow-[0_0_20px_rgba(234,179,8,0.4)]">View Leaderboard</Link>
              <Link href="/register" className="bg-transparent border-2 border-gray-600 text-white font-black py-4 px-8 rounded-full hover:border-white transition">Apply to Compete (₦2,000)</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MAJESTIC TOP 3 PREVIEW */}
      <section className="py-16 px-4 max-w-4xl mx-auto relative z-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-white">Meet the Frontrunners</h2>
          <p className="text-sm text-gray-500 mt-2">The current Top 3 contestants leading the race.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <Link href={`/vote/${top3[1].contestant_id}`} className="block group">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-2xl rounded-b-xl p-3 md:p-5 border-t-4 border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.2)] text-center relative transition-transform group-hover:-translate-y-2">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gray-400 text-black text-xs font-black px-3 py-1 rounded-full">2nd</div>
                <img src={top3[1].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-gray-400 mt-4" />
                <h3 className="text-xs md:text-sm font-black text-white truncate">{top3[1].stage_name || top3[1].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-400 truncate">{top3[1].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-gray-300">{top3[1].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <Link href={`/vote/${top3[0].contestant_id}`} className="block group">
              <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-900/10 rounded-t-2xl rounded-b-xl p-4 md:p-6 border-t-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] text-center relative transition-transform group-hover:-translate-y-2 z-10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs md:text-sm font-black px-4 py-2 rounded-full flex items-center gap-1 shadow-xl"><Crown size={16}/> 1st</div>
                <img src={top3[0].photo_url} className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-yellow-500 mt-6 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                <h3 className="text-sm md:text-base font-black text-white truncate">{top3[0].stage_name || top3[0].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-300 truncate">{top3[0].church}</p>
                <div className="mt-2 md:mt-3 text-2xl md:text-3xl font-black text-yellow-500 drop-shadow-md">{top3[0].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Link href={`/vote/${top3[2].contestant_id}`} className="block group">
              <div className="bg-gradient-to-b from-amber-900/40 to-black rounded-t-2xl rounded-b-xl p-3 md:p-5 border-t-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.2)] text-center relative transition-transform group-hover:-translate-y-2">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-3 py-1 rounded-full">3rd</div>
                <img src={top3[2].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-amber-700 mt-4" />
                <h3 className="text-xs md:text-sm font-black text-white truncate">{top3[2].stage_name || top3[2].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-400 truncate">{top3[2].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-amber-500">{top3[2].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/leaderboard" className="text-sm font-bold text-gray-500 hover:text-white underline">View full leaderboard →</Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-[#121212]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-black text-center mb-10 text-white">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-800 rounded-2xl bg-black/50">
              <div className="bg-yellow-500 text-black w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2 text-white">Apply</h3>
              <p className="text-sm text-gray-400">Contestants register, upload their talent video, and pay the ₦2,000 fee.</p>
            </div>
            <div className="text-center p-6 border border-gray-800 rounded-2xl bg-black/50">
              <div className="bg-yellow-500 text-black w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2 text-white">Vote</h3>
              <p className="text-sm text-gray-400">Supporters buy vote bundles (₦50 to ₦10,000) to push their favourite up the leaderboard.</p>
            </div>
            <div className="text-center p-6 border border-gray-800 rounded-2xl bg-black/50">
              <div className="bg-yellow-500 text-black w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2 text-white">Win</h3>
              <p className="text-sm text-gray-400">The top 20 qualify for the live show. The highest votes win the grand prize.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-500 py-12 px-4 border-t border-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size={32} showText={true} />
              <h3 className="text-white font-black text-lg uppercase">TFTC 2027</h3>
            </div>
            <p className="text-xs leading-relaxed">The Face & The Crown Live Show. A gospel competition designed to discover and celebrate talent.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Apply to Compete</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/media-agreement" className="hover:text-white transition">Media Agreement</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition"><Share2 size={18} /></a>
              <a href="#" className="hover:text-white transition"><Mail size={18} /></a>
            </div>
            <p className="text-xs mt-4">support@tftcliveshow.com</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-900 text-center text-xs">
          © 2027 The Face & The Crown Live Show. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
