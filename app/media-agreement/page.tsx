import Link from 'next/link';
export default function MediaAgreement() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-black mb-4">Content & Media Agreement</h1>
        <p className="text-sm text-gray-600 mb-4">By submitting your application, you grant TFTC Live Show the following rights:</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>The irrevocable right to use, reproduce, edit, publish, and broadcast your name, photographs, videos, and biography for promotional and commercial purposes.</li>
          <li>You confirm that all performance materials are original and do not infringe on any third-party rights.</li>
          <li>You agree to conduct yourself in an orderly manner. The organizers may disqualify any contestant for misconduct, fraud, or hate speech without refund.</li>
        </ul>
        <Link href="/register" className="mt-6 inline-block bg-black text-white px-6 py-2 rounded-lg font-bold text-sm">← Back to Registration</Link>
      </div>
    </div>
  );
}
