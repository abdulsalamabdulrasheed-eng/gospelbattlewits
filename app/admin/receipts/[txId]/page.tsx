'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, CheckCircle2, Crown, Star } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ReceiptPage() {
  const { txId } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState<any>(null);
  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch transaction
      const { data: t } = await supabase.from('transactions').select('*').eq('id', txId).single();
      
      if (t) {
        setTx(t);
        // If the transaction has a contestant_id, fetch the contestant details
        if (t.contestant_id) {
          const { data: c } = await supabase.from('contestants').select('*').eq('id', t.contestant_id).single();
          if (c) setContestant(c);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [txId]);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Receipt_${tx.reference}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Failed to generate receipt.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white font-bold">Loading Receipt...</div>;
  if (!tx) return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white font-bold">Receipt not found.</div>;

  const isVote = tx.votes_credited > 0;
  const theme = isVote ? {
    accent: 'text-[#D4AF37]',
    border: 'border-[#D4AF37]/30',
    bg: 'bg-[#0A0A0A]',
    icon: <Crown size={20} className="text-[#D4AF37]" />,
    title: 'Vote Successful',
    subtitle: 'Your voice has been heard.',
  } : {
    accent: 'text-gray-300',
    border: 'border-gray-700',
    bg: 'bg-[#111111]',
    icon: <Star size={20} className="text-gray-400" />,
    title: 'Registration Confirmed',
    subtitle: 'Welcome to the TFTC Live Show 2027 stage.',
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 md:p-10 flex flex-col items-center`}>
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link href="/admin/transactions" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft size={16}/> Back
        </Link>
        <button onClick={downloadReceipt} disabled={downloading} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg hover:bg-yellow-600 transition">
          <Download size={16}/> {downloading ? 'Generating...' : 'Download'}
        </button>
      </div>

      {/* RECEIPT CARD */}
      <div ref={receiptRef} className={`w-full max-w-md ${theme.bg} border ${theme.border} rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.1)] overflow-hidden relative`}>
        
        {/* Background Line Art (Stanbic Style) */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 400 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <path 
              d="M 150 500 C 120 450, 100 400, 120 350 C 140 300, 180 280, 180 230 C 180 180, 150 150, 160 120 C 170 90, 200 80, 220 100 C 240 120, 230 150, 230 180 C 230 210, 260 240, 250 280 C 240 320, 200 350, 200 400 C 200 450, 230 500, 250 550" 
              fill="none" 
              stroke={isVote ? "#D4AF37" : "#9CA3AF"} 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            {/* Mic */}
            <rect x="205" y="230" width="10" height="20" rx="5" fill="none" stroke={isVote ? "#D4AF37" : "#9CA3AF"} strokeWidth="2" transform="rotate(-20 210 240)" />
            {/* Sound Waves */}
            <path d="M 260 240 Q 280 260 260 280" fill="none" stroke={isVote ? "#D4AF37" : "#9CA3AF"} strokeWidth="1.5" opacity="0.5" />
            <path d="M 270 230 Q 300 260 270 290" fill="none" stroke={isVote ? "#D4AF37" : "#9CA3AF"} strokeWidth="1.5" opacity="0.3" />
          </svg>
        </div>

        {/* Header */}
        <div className="relative z-10 p-8 flex flex-col items-center border-b border-white/10">
          <div className="mb-4"><Logo size={48} showText={false} /></div>
          <h1 className="text-white font-black tracking-widest text-lg">TFTC LIVE SHOW</h1>
          <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] mt-1">Official Payment Receipt</p>
        </div>

        {/* Status */}
        <div className={`relative z-10 p-3 flex items-center justify-center gap-2 border-b border-white/10 bg-white/5`}>
          {theme.icon}
          <span className={`font-bold text-xs uppercase tracking-wider ${theme.accent}`}>{theme.title}</span>
        </div>

        {/* Amount */}
        <div className="relative z-10 p-8 text-center border-b border-dashed border-white/10">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount Paid</p>
          <h2 className={`text-5xl font-black tracking-tight ${theme.accent}`}>₦{(tx.amount / 100).toLocaleString()}</h2>
          {isVote ? (
            <p className="text-xs text-gray-300 mt-3 font-semibold bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">{tx.votes_credited} Votes Credited</p>
          ) : (
            <p className="text-xs text-gray-300 mt-3 font-semibold bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">Registration Fee</p>
          )}
        </div>

        {/* Details */}
        <div className="relative z-10 p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-white/5 pb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Reference</span>
            <span className="text-[11px] font-mono font-bold text-white">{tx.reference}</span>
          </div>
          <div className="flex justify-between items-start border-b border-white/5 pb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Date</span>
            <span className="text-[11px] font-bold text-white">{new Date(tx.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-start border-b border-white/5 pb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Payer</span>
            <span className="text-[11px] font-bold text-white truncate max-w-[200px]">{tx.voter_email}</span>
          </div>
          {contestant && (
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Contestant</span>
              <span className="text-[11px] font-bold text-white text-right">{contestant.stage_name || contestant.full_name}<br/><span className="text-[9px] text-gray-500">{contestant.contestant_id}</span></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 text-center border-t border-white/10 bg-white/5">
          <p className="text-[10px] text-gray-400 font-medium">{theme.subtitle}</p>
          <div className="mt-2 flex items-center justify-center gap-1 opacity-50">
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Secured by</span>
            <span className="text-[10px] font-black text-white">Paystack</span>
          </div>
        </div>
      </div>
    </div>
  );
}
