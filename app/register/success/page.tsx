'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-green-600">✓</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h1>
        <p className="text-gray-600 text-sm mb-8">
          Your application is currently <strong>pending review</strong>. Once approved by the admin, your public profile will go live and you will be able to receive votes.
        </p>
        <Link href="/" className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">
          Return to Homepage
        </Link>
      </div>
    </main>
  );
}
