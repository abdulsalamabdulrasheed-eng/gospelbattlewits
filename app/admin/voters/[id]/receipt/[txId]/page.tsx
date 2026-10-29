'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { Download, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ReceiptPage() {
  const { id, txId } = useParams();
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

  if (loading) return <div className="p-10 font-bold text-center">Loading Receipt...</div>;
  if (!tx || !contestant) return <div className="p-10 font-bold text-center">Receipt not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link href={`/admin/voters/${id}`} className="text-sm font-bold text-gray-600 hover:text-black flex items-center gap-1">
          <ArrowLeft size={16}/> Back
        </Link>
        <button onClick={downloadReceipt} disabled={downloading} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          <Download size={16}/> {downloading ? 'Generating...' : 'Download'}
        </button>
      </div>

      {/* RECEIPT CARD */}
      <div ref={receiptRef} className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0A0A0A] p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.2),transparent_50%)]"></div>
          <div className="relative z-10">
            <div className="bg-yellow-500 text-black w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-xl">GB</div>
            <h1 className="text-white font-black tracking-widest text-lg">TFTC LIVE SHOW</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Official Payment Receipt</p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 p-4 flex items-center justify-center gap-2 border-b border-green-100">
          <CheckCircle2 size={18} className="text-green-600" />
          <span className="text-green-700 font-bold text-sm">Payment Successful</span>
        </div>

        {/* Amount */}
        <div className="p-6 text-center border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount Paid</p>
          <h2 className="text-4xl font-black text-gray-900">₦{(tx.amount / 100).toLocaleString()}</h2>
          <p className="text-sm text-gray-500 mt-1">{tx.votes_credited} Votes Credited</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4 bg-gray-50/50">
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-bold">Reference</span>
            <span className="text-xs font-mono font-bold text-gray-900">{tx.reference}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-bold">Date</span>
            <span className="text-xs font-bold text-gray-900">{new Date(tx.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-bold">Voter</span>
            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">{tx.voter_email}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-bold">Contestant</span>
            <span className="text-xs font-bold text-gray-900">{contestant.stage_name || contestant.full_name}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-bold">ID</span>
            <span className="text-xs font-bold text-gray-900">{contestant.contestant_id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Thank you for supporting TFTC Live Show 2027.</p>
          <p className="text-[10px] text-gray-400 mt-1">Secured by Paystack</p>
        </div>
      </div>
    </div>
  );
}
