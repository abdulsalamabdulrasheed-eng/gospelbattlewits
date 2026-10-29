import Link from 'next/link';
export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-black mb-4">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 mb-4">By registering for TFTC Live Show 2027, you agree to the following terms:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>You must be 18 years or older to participate.</li>
          <li>All information provided must be accurate and original.</li>
          <li>The ₦2,000 registration fee is non-refundable.</li>
          <li>Votes are paid and non-refundable. Votes cannot be transferred.</li>
          <li>Any attempt to manipulate votes (bots, fake cards) will lead to immediate disqualification.</li>
          <li>The organizers reserve the right to change the show date, prizes, or format with prior notice.</li>
        </ul>
        <Link href="/register" className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">← Back to Registration</Link>
      </div>
    </div>
  );
}
