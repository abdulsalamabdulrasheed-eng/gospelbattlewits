'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window { PaystackPop: any; }
}

const BUCKET_NAME = 'contestants media';

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '', stage_name: '', email: '', phone: '', church: '', dob: '', category: 'Singing', bio: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
    // Check if redirected from login with error
    const error = searchParams.get('error');
    if (error === 'invalid_credentials' || error === 'no_account') {
      setErrorMsg('Your credentials were not found. Please fill the form below to register.');
    }
  }, [searchParams]);

  const checkRegistrationStatus = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'registration_open').single();
    if (data && data.value === false) setIsClosed(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    return new Date(difference).getUTCFullYear() - 1970;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (isClosed) return setErrorMsg('Registration is currently closed.');
    if (!agreed) return setErrorMsg('You must agree to the Content & Media Agreement.');
    if (!photoFile) return setErrorMsg('Please upload a profile photo.');
    if (!videoFile) return setErrorMsg('Please upload a talent video.');
    if (calculateAge(formData.dob) < 18) return setErrorMsg('You must be 18 or older to register.');

    setLoading(true);

    try {
      setUploading(true);
      
      const photoExt = photoFile.name.split('.').pop();
      const photoName = `${Date.now()}-${formData.email}.${photoExt}`;
      const { error: photoError } = await supabase.storage.from(BUCKET_NAME).upload(`photos/${photoName}`, photoFile);
      if (photoError) throw new Error('Photo upload failed: ' + photoError.message);
      const { data: photoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`photos/${photoName}`);

      const videoExt = videoFile.name.split('.').pop();
      const videoName = `${Date.now()}-${formData.email}.${videoExt}`;
      const { error: videoError } = await supabase.storage.from(BUCKET_NAME).upload(`videos/${videoName}`, videoFile);
      if (videoError) throw new Error('Video upload failed: ' + videoError.message);
      const { data: videoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${videoName}`);

      setUploading(false);

      if (!window.PaystackPop) throw new Error('Paystack is loading. Please try again.');

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: formData.email,
        amount: 2000 * 100,
        currency: 'NGN',
        ref: `REG-${Date.now()}`,
        metadata: { type: 'registration', ...formData, photo_url: photoData.publicUrl, video_url: videoData.publicUrl },
        callback: async function (response: any) {
          try {
            // 1. Create Auth User with temp password
            const tempPassword = `TFTC-${Date.now()}`;
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: formData.email,
              password: tempPassword,
            });
            if (authError) throw new Error('Auth creation failed: ' + authError.message);

            // 2. Insert into database
            const { count } = await supabase.from('contestants').select('*', { count: 'exact', head: true });
            const nextNumber = (count || 0) + 1;
            const contestantId = `TFTC-${nextNumber.toString().padStart(4, '0')}`;

            const { error: insertError } = await supabase.from('contestants').insert({
              contestant_id: contestantId, full_name: formData.full_name, stage_name: formData.stage_name,
              email: formData.email, phone: formData.phone, church: formData.church, category: formData.category,
              bio: formData.bio, photo_url: photoData.publicUrl, video_url: videoData.publicUrl,
              status: 'pending', total_votes: 0,
            });
            if (insertError) throw insertError;

            // 3. Log transaction
            await supabase.from('transactions').insert({
              reference: response.reference, voter_email: formData.email, amount: 2000 * 100, votes_credited: 0, status: 'success',
            });

            // 4. Sign in (auto-login)
            await supabase.auth.signInWithPassword({ email: formData.email, password: tempPassword });
            
            router.push('/contestant/set-password');
          } catch (err: any) {
            alert('Payment succeeded but save failed: ' + err.message);
            setLoading(false);
          }
        },
        onClose: function () { setLoading(false); setErrorMsg('Payment cancelled. Registration incomplete.'); }
      });
      handler.openIframe();
    } catch (error: any) {
      setErrorMsg(error.message); setLoading(false); setUploading(false);
    }
  };

  if (isClosed) return <div className="min-h-screen flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"><h1 className="text-2xl font-black mb-2">Registration Closed</h1><p className="text-gray-500 mb-6">Registration is no longer accepting applications.</p><Link href="/" className="block w-full bg-black text-white font-bold py-3 rounded-lg">Return Home</Link></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold">← Back to Home</Link>
        <span className="font-bold">Registration</span>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-gray-900">Apply to Compete</h1>
            <p className="text-gray-500 text-sm mt-2">You are highly expected. Good luck!</p>
            <div className="mt-3 inline-block bg-green-50 text-green-700 font-bold px-4 py-2 rounded-full text-sm">Registration Fee: ₦2,000</div>
          </div>

          <div className="text-center mb-6 text-sm">
            Already have an account? <Link href="/login" className="font-bold text-black underline">Login here</Link>
          </div>

          {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label><input type="text" name="full_name" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Stage Name</label><input type="text" name="stage_name" onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Email *</label><input type="email" name="email" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth *</label><input type="date" name="dob" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Church *</label><input type="text" name="church" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
            </div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Category *</label><select name="category" onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white"><option>Singing</option><option>Preaching</option><option>Comedy / Skit</option><option>Dance</option><option>Instrumental</option></select></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo *</label><input type="file" accept="image/jpeg, image/png" required onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Talent Video *</label><input type="file" accept="video/mp4, video/quicktime" required onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Short Bio *</label><textarea name="bio" required onChange={handleChange} rows={3} className="w-full p-3 border rounded-lg outline-none focus:border-black"></textarea></div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-black" />
                <span className="text-sm text-gray-600">I agree to the TFTC Content & Media Agreement. I understand the ₦2,000 fee is non-refundable.</span>
              </label>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 text-lg mt-4">{loading ? (uploading ? 'Uploading Media...' : 'Connecting to Paystack...') : 'Pay ₦2,000 & Submit'}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
