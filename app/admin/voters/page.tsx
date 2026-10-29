'use client';

import { Users } from 'lucide-react';

export default function VotersIndex() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Users size={32} className="text-gray-400" />
      </div>
      <h1 className="text-xl font-black text-gray-900">Select a Contestant</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Choose a contestant from the sidebar on the left to view their voters, receipts, and payment details.
      </p>
    </div>
  );
}
