'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';

interface Contestant {
  id: string;
  contestant_id: string;
  full_name: string;
  stage_name: string;
  church: string;
  bio: string;
  photo_url: string;
  video_url: string;
  total_votes: number;
}

const VOTE_BUNDLES = [
  { votes: 1, amount: 50 },
  { votes: 11, amount: 500 },
  { votes: 25, amount: 1000 },
  { votes: 70, amount: 2500 },
  { votes: 155, amount: 5000 },
  { votes: 325, amount: 10000 },
];

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function ContestantProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [selectedBundle, setSelectedBundle] = useState(VOTE_BUNDLES[0]);
  const [voterEmail, setVoterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{show: boolean, title: string, message: string, isError: boolean}>({
    show: false, title: '', message: '', isError: false
  });

  useEffect(() => {
    if (id) fetchContestant();
  }, [id]);

  const fetchContestant = async () => {
    const { data } = await supabase
      .from('contestants')
      .select('*')
      .eq('contestant_id', id)
      .single();
    if (data) setContestant(data);
  };

  const showPopup = (title: string, message: string, isError: boolean = false) => {
    setModalConfig({ show: true, title, message, isError });
  };

  const handlePayment = () => {
    if (!voterEmail) return showPopup('Email Required', 'Please enter your email address to receive the receipt.', true);
    if (!window.PaystackPop) return showPopup('Loading', 'Paystack is initializing, please try again in a second.', true);
    if (!contestant) return;

    setLoading(true);
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: voterEmail,
      amount: selectedBundle.amount * 100,
      currency: 'NGN',
      ref: `TFTC-${Date.now()}`,
      metadata: {
        contestant_id: contestant.id,
        votes_to_credit: selectedBundle.votes,
      },
      callback: function (response: any) {
        setLoading(false);
        showPopup('Payment Successful', `Thank you! Your ${selectedBundle.votes} votes for ${contestant.stage_name} have been received. Ref: ${response.reference}`);
        router.refresh();
      },
      onClose: function () {
        setLoading(false);
      }
    });
    handler.openIframe();
  };

  if (!contestant) return <div className="p-10 text-center font-bold">Loading profile...</div>;

  return (
    <main className="min-h-screen bg-white pb-32">
      
      {/* CUSTOM MODAL */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-4 text-center ${modalConfig.isError ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white mb-3 shadow-sm">
                {modalConfig.isError ? (
                  <span className="text-2xl text-red-500">✕</span>
                ) : (
                  <span className="text-2xl text-green-500">✓</span>
                )}
              </div>
              <h3 className="text-lg font-black text-gray-900">{modalConfig.title}</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6">{modalConfig.message}</p>
              <button
                onClick={() => setModalConfig({ ...modalConfig, show: false })}
                className="w-full bg-black text-white font-bold py-3 rounded-lg active:scale-95 transition-transform"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="text-sm font-bold">← Back</button>
        <span className="font-bold">{contestant.contestant_id}</span>
      </div>

      {/* Video Section */}
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center text-white">
        {contestant.video_url ? (
          <video controls className="w-full h-full object-cover" src={contestant.video_url} />
        ) : (
          <p className="text-sm font-bold">Talent Video Coming Soon</p>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-black">{contestant.stage_name || contestant.full_name}</h1>
            <p className="text-gray-500 font-semibold">{contestant.church}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-black">{contestant.total_votes.toLocaleString()}</div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Votes</div>
          </div>
        </div>
        <p className="text-gray-700 text-sm mb-6">{contestant.bio || 'No bio provided yet.'}</p>

        <h3 className="font-bold mb-3 text-lg border-t pt-4">Support with Votes</h3>
        
        {/* Vote Bundles */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {VOTE_BUNDLES.map((bundle) => (
            <button
              key={bundle.votes}
              onClick={() => setSelectedBundle(bundle)}
              className={`p-3 rounded-lg border-2 text-center transition ${
                selectedBundle.votes === bundle.votes
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-black hover:border-gray-400'
              }`}
            >
              <div className="font-black text-lg">{bundle.votes}</div>
              <div className="text-xs font-semibold">₦{bundle.amount.toLocaleString()}</div>
            </button>
          ))}
        </div>

        {/* Voter Email Input */}
        <input
          type="email"
          placeholder="Enter your email for the receipt"
          value={voterEmail}
          onChange={(e) => setVoterEmail(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 text-black font-semibold outline-none focus:border-black"
        />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 font-semibold">You are buying {selectedBundle.votes} votes</span>
          <span className="font-black text-lg">₦{selectedBundle.amount.toLocaleString()}</span>
        </div>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-black text-white font-bold py-4 rounded-lg disabled:opacity-50 transition-transform active:scale-95"
        >
          {loading ? 'Connecting to Paystack...' : `Pay ₦${selectedBundle.amount.toLocaleString()} via Paystack`}
        </button>
      </div>
    </main>
  );
}
