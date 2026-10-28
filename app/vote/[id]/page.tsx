'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Mail, ShieldCheck } from 'lucide-react';

const VOTE_BUNDLES = [
  { votes: 1, amount: 50 },
  { votes: 11, amount: 500 },
  { votes: 25, amount: 1000 },
  { votes: 70, amount: 2500 },
  { votes: 155, amount: 5000 },
  { votes: 325, amount: 10000 },
];

declare global { interface Window { PaystackPop: any; } }

export default function ContestantProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [contestant, setContestant] = useState<any>(null);
  const [selectedBundle, setSelectedBundle] = useState(VOTE_BUNDLES[0]);
  const [voterEmail, setVoterEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [votingOpen, setVotingOpen] = useState(true);
  
  const [modal, setModal] = useState({ show: false, title: '', message: '', isError: false });

  useEffect(() => {
    if (id) { fetchContestant(); checkVotingStatus(); }
  }, [id]);

  const fetchContestant = async () => {
    const { data } = await supabase.from('contestants').select('*').eq('contestant_id', id).single();
    if (data) setContestant(data);
    setLoading(false);
  };

  const checkVotingStatus = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'voting_open').single();
    if (data && data.value === false) setVotingOpen(false);
  };

  const showModal = (title: string, message: string, isError = false) => {
    setModal({ show: true, title, message, isError });
  };

  const handlePayment = () => {
    if (!votingOpen) return showModal('Voting Closed', 'Voting is no longer open.', true);
    if (!voterEmail || !voterEmail.includes('@')) return showModal('Email Required', 'Please enter a valid email address.', true);
    if (!window.PaystackPop) return showModal('Error', 'Paystack is initializing.', true);
    if (!contestant) return;

    setProcessing(true);
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: voterEmail,
      amount: selectedBundle.amount * 100,
      currency: 'NGN',
      ref: `TFTC-${Date.now()}`,
      metadata: { contestant_id: contestant.id, votes_to_credit: selectedBundle.votes },
      callback: function (response: any) {
        setProcessing(false);
        showModal('Payment Successful', `Thank you! Your ${selectedBundle.votes} votes are being processed.`);
        setContestant({ ...contestant, total_votes: contestant.total_votes + selectedBundle.votes });
      },
      onClose: function () { setProcessing(false); showModal('Cancelled', 'Transaction cancelled.', true); }
    });
    handler.openIframe();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  if (!contestant) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Not found.</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-28 md:pb-10">
      
      {/* MODAL */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`p-4 text-center ${modal.isError ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-black ${modal.isError ? 'text-red-700' : 'text-green-700'}`}>{modal.title}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">{modal.message}</p>
              <button onClick={() => setModal({ ...modal, show: false })} className="w-full bg-black text-white font-bold py-3 rounded-lg">Got it</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black text-white p-3 md:p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-bold"><ChevronLeft size={18}/> Back</button>
        <span className="font-bold text-xs bg-gray-800 px-3 py-1 rounded-md">{contestant.contestant_id}</span>
      </div>

      <div className="max-w-4xl mx-auto md:mt-6 md:rounded-2xl md:overflow-hidden md:shadow-lg md:border bg-white">
        
        {/* Profile Header (Horizontal Layout) */}
        <div className="p-4 md:p-8 flex items-center gap-4 md:gap-6 border-b border-gray-100">
          <img 
            src={contestant.photo_url} 
            alt="Profile" 
            className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-gray-200 shadow-md shrink-0" 
          />
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">{contestant.stage_name || contestant.full_name}</h1>
            <p className="text-xs md:text-sm text-gray-500 font-semibold mt-1">{contestant.church}</p>
            <div className="mt-2 md:mt-3 inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-lg">
              <span className="text-lg md:text-2xl font-black text-black">{contestant.total_votes.toLocaleString()}</span>
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider">Votes</span>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
          {contestant.video_url ? (
            <video controls className="w-full h-full object-contain" src={contestant.video_url} />
          ) : (
            <p className="text-gray-400 text-sm">No video available</p>
          )}
        </div>

        <div className="p-4 md:p-8">
          <p className="text-sm md:text-base text-gray-600 mb-8">{contestant.bio || 'No bio provided.'}</p>

          {/* Voting Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Support with Votes</h3>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1"><ShieldCheck size={12}/> Secure</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
              {VOTE_BUNDLES.map((bundle) => (
                <button
                  key={bundle.votes}
                  onClick={() => setSelectedBundle(bundle)}
                  disabled={!votingOpen}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedBundle.votes === bundle.votes
                      ? 'border-black bg-black text-white shadow-md scale-[1.02]'
                      : 'border-gray-200 bg-white text-black hover:border-gray-400'
                  } ${!votingOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-black text-lg md:text-xl">{bundle.votes}</div>
                  <div className="text-xs font-semibold opacity-80">₦{bundle.amount.toLocaleString()}</div>
                </button>
              ))}
            </div>

            {/* Email Input */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Enter your email for the receipt"
                value={voterEmail}
                onChange={(e) => setVoterEmail(e.target.value)}
                disabled={!votingOpen}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-black font-semibold outline-none focus:border-black focus:bg-white transition disabled:opacity-50"
              />
            </div>

            {/* Desktop Pay Button */}
            <button
              onClick={handlePayment}
              disabled={processing || !votingOpen}
              className="hidden md:flex w-full bg-black text-white font-bold py-4 rounded-xl disabled:opacity-50 justify-center items-center gap-2 shadow-lg hover:bg-gray-800 transition text-base"
            >
              {!votingOpen ? 'Voting Closed' : processing ? 'Processing...' : `Pay ₦${selectedBundle.amount.toLocaleString()} via Paystack`}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
              {votingOpen ? `Buying ${selectedBundle.votes} votes` : 'Voting Closed'}
            </div>
            <div className="text-xl font-black text-black">{votingOpen ? `₦${selectedBundle.amount.toLocaleString()}` : ''}</div>
          </div>
          <button
            onClick={handlePayment}
            disabled={processing || !votingOpen}
            className="bg-black text-white font-bold py-3.5 px-8 rounded-xl disabled:opacity-50 shadow-lg hover:bg-gray-800 transition active:scale-95 text-sm"
          >
            {!votingOpen ? 'Voting Closed' : processing ? 'Processing...' : `Pay ₦${selectedBundle.amount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </main>
  );
}
