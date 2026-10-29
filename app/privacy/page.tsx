import Link from 'next/link';
export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-black mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-4">We value your privacy. This policy explains how we handle your data:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Your personal data (name, email, phone) is stored securely and will not be sold to third parties.</li>
          <li>Photos and videos submitted will be displayed publicly on the voting platform.</li>
          <li>Voter emails are used only for payment receipts and are never shown publicly.</li>
          <li>You can request deletion of your data by contacting the organizers after the show.</li>
        </ul>
        <Link href="/register" className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">← Back to Registration</Link>
      </div>
    </div>
  );
}
