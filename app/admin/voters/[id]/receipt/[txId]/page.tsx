'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, CheckCircle2, Crown, Star } from 'lucide-react';
import { GospelStage } from '@/components/GospelStage';

export default function ReceiptPage() {
  const { id, txId } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState<any>(null);
  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: t } = await supabase.from('transactions').select('*').eq('id', txId).single();
      const { data: c } = await supabase.from('contestants').select('*').eq('contestant_id', id).single();
      if (t) setTx(t);
      if (c) setContestant(c);
      setLoading(false);
    };
    fetchData();
  }, [id, txId]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100 font-bold">Loading Receipt...</div>;
  if (!tx || !contestant) return <div className="min-h-screen flex items-center justify-center bg-gray-100 font-bold">Receipt not found.</div>;

  const isVote = tx.votes_credited > 0;
  const theme = isVote ? {
    bg: 'bg-[#0A0A0A]',
    card: 'bg-white',
    accent: 'text-yellow-500',
    border: 'border-yellow-500',
    btn: 'bg-yellow-500 text-black',
    icon: <Crown size={20} />,
    title: 'Vote Successful',
    subtitle: 'Thank you for supporting your favourite contestant.',
  } : {
    bg: 'bg-gray-900',
    card: 'bg-white',
    accent: 'text-gray-700',
    border: 'border-gray-300',
    btn: 'bg-gray-900 text-white',
    icon: <Star size={20} />,
    title: 'Registration Confirmed',
    subtitle: 'Welcome to the TFTC Live Show 2027 stage.',
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 md:p-10 flex flex-col items-center`}>
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link href={`/admin/voters/${id}`} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-1">
          <ArrowLeft size={16}/> Back
        </Link>
        <button onClick={downloadReceipt} disabled={downloading} className={`${theme.btn} px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg`}>
          <Download size={16}/> {downloading ? 'Generating...' : 'Download'}
        </button>
      </div>

      {/* RECEIPT CARD */}
      <div ref={receiptRef} className={`w-full max-w-md ${theme.card} rounded-2xl shadow-2xl overflow-hidden relative`}>
        
        {/* Gospel Stage Animation */}
        <GospelStage type={isVote ? 'vote' : 'registration'} />

        {/* Status Bar */}
        <div className={`p-3 flex items-center justify-center gap-2 border-b ${isVote ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
          <CheckCircle2 size={16} />
          <span className="font-bold text-xs uppercase tracking-wider">{theme.title}</span>
        </div>

        {/* Amount */}
        <div className="p-8 text-center border-b border-dashed border-gray-200 relative">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Amount Paid</p>
          <h2 className={`text-4xl font-black tracking-tight ${theme.accent}`}>₦{(tx.amount / 100).toLocaleString()}</h2>
          {isVote ? (
            <p className="text-xs text-gray-600 mt-2 font-semibold bg-gray-100 inline-block px-3 py-1 rounded-full">{tx.votes_credited} Votes Credited</p>
          ) : (
            <p className="text-xs text-gray-600 mt-2 font-semibold bg-gray-100 inline-block px-3 py-1 rounded-full">Registration Fee</p>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-bold uppercase">Reference</span>
            <span className="text-[11px] font-mono font-bold text-gray-900">{tx.reference}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-bold uppercase">Date</span>
            <span className="text-[11px] font-bold text-gray-900">{new Date(tx.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-bold uppercase">Voter</span>
            <span className="text-[11px] font-bold text-gray-900 truncate max-w-[200px]">{tx.voter_email}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-gray-500 font-bold uppercase">Contestant</span>
            <span className="text-[11px] font-bold text-gray-900 text-right">{contestant.stage_name || contestant.full_name}<br/><span className="text-[9px] text-gray-400">{contestant.contestant_id}</span></span>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 text-center border-t ${isVote ? 'border-yellow-100 bg-yellow-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
          <p className="text-[10px] text-gray-500 font-medium">{theme.subtitle}</p>
          <div className="mt-2 flex items-center justify-center gap-1 opacity-50">
            <span className="text-[8px] font-bold uppercase tracking-widest">Secured by</span>
            <span className="text-[10px] font-black text-black">Paystack</span>
          </div>
        </div>
      </div>
    </div>
  );
}
