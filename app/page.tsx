'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Trophy, Users, Star, Share2, Mail } from 'lucide-react';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  total_votes: number;
  photo_url: string;
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
        .limit(3);
      if (data) setTop3(data);
      setLoading(false);
    };
    fetchTop3();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <nav className="bg-black text-white p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1 rounded font-black text-xs">GB</div>
            <span className="font-black text-sm tracking-wider uppercase">TFTC 2027</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <Link href="/leaderboard" className="hover:text-gray-300">Leaderboard</Link>
            <Link href="/register" className="bg-yellow-500 text-black px-4 py-2 rounded-full hover:bg-yellow-400 transition">Apply Now</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-black text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black z-0"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">VOTE YOUR <span className="text-yellow-500">FAVOURITE</span></h1>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">The top 20 contestants with the highest votes will battle live on stage for the grand prize.</p>
            
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
              <Link href="/leaderboard" className="bg-yellow-500 text-black font-black py-4 px-8 rounded-full hover:bg-yellow-400 transition">View Leaderboard</Link>
              <Link href="/register" className="bg-transparent border-2 border-white text-white font-black py-4 px-8 rounded-full hover:bg-white hover:text-black transition">Apply to Compete (₦2,000)</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRAND TOP 3 PREVIEW */}
      <section className="py-16 px-4 max-w-4xl mx-auto -mt-10 relative z-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">Meet the Frontrunners</h2>
          <p className="text-sm text-gray-500">The current Top 3 contestants leading the race.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <Link href={`/vote/${top3[1].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-3 md:p-5 border-2 border-gray-300 shadow-lg text-center relative transition-transform group-hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-black px-3 py-1 rounded-full">2nd</div>
                <img src={top3[1].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-2 border-gray-300 mt-2" />
                <h3 className="text-xs md:text-sm font-black truncate">{top3[1].stage_name || top3[1].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[1].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-gray-800">{top3[1].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <Link href={`/vote/${top3[0].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-4 md:p-6 border-4 border-yellow-500 shadow-2xl text-center relative transition-transform group-hover:-translate-y-1 bg-gradient-to-b from-yellow-50 to-white z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg"><Crown size={14}/> 1st</div>
                <img src={top3[0].photo_url} className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-2 md:mb-3 border-4 border-yellow-500 mt-2 shadow-md" />
                <h3 className="text-sm md:text-base font-black truncate">{top3[0].stage_name || top3[0].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[0].church}</p>
                <div className="mt-2 md:mt-3 text-2xl md:text-3xl font-black text-yellow-600">{top3[0].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Link href={`/vote/${top3[2].contestant_id}`} className="block group">
              <div className="bg-white rounded-2xl p-3 md:p-5 border-2 border-amber-600 shadow-lg text-center relative transition-transform group-hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-full">3rd</div>
                <img src={top3[2].photo_url} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mx-auto mb-2 md:mb-3 border-2 border-amber-600 mt-2" />
                <h3 className="text-xs md:text-sm font-black truncate">{top3[2].stage_name || top3[2].full_name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{top3[2].church}</p>
                <div className="mt-2 md:mt-3 text-lg md:text-xl font-black text-amber-700">{top3[2].total_votes.toLocaleString()}</div>
              </div>
            </Link>
          )}
        </div>
        <div className="text-center mt-6">
          <Link href="/leaderboard" className="text-sm font-bold text-gray-500 hover:text-black underline">View full leaderboard →</Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-black text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-2xl bg-gray-50">
              <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Apply</h3>
              <p className="text-sm text-gray-500">Contestants register, upload their talent video, and pay the ₦2,000 fee.</p>
            </div>
            <div className="text-center p-6 border rounded-2xl bg-gray-50">
              <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Vote</h3>
              <p className="text-sm text-gray-500">Supporters buy vote bundles (₦50 to ₦10,000) to push their favourite up the leaderboard.</p>
            </div>
            <div className="text-center p-6 border rounded-2xl bg-gray-50">
              <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Win</h3>
              <p className="text-sm text-gray-500">The top 20 qualify for the live show. The highest votes win the grand prize.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-black text-lg mb-4 uppercase">TFTC 2027</h3>
            <p className="text-xs leading-relaxed">The Face & The Crown Live Show. A gospel competition designed to discover and celebrate talent.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Apply to Compete</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Contestant Login</Link></li>
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
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-xs">
          © 2027 The Face & The Crown Live Show. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
