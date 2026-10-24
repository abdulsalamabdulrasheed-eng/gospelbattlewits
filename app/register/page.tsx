'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

// Match your exact Supabase bucket name here
const BUCKET_NAME = 'contestants media';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    stage_name: '',
    email: '',
    phone: '',
    church: '',
    dob: '',
    category: 'Singing',
    bio: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const age = new Date(difference).getUTCFullYear() - 1970;
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!agreed) return setErrorMsg('You must agree to the Content & Media Agreement.');
    if (!photoFile) return setErrorMsg('Please upload a profile photo.');
    if (!videoFile) return setErrorMsg('Please upload a talent video.');
    
    const age = calculateAge(formData.dob);
    if (age < 18) return setErrorMsg('You must be 18 or older to register.');

    setLoading(true);

    try {
      const { count } = await supabase
        .from('contestants')
        .select('*', { count: 'exact', head: true });
      
      if (count && count >= 2000) {
        throw new Error('Registration is full. We have reached 2,000 contestants.');
      }

      setUploading(true);
      
      // 1. Upload Photo
      const photoExt = photoFile.name.split('.').pop();
      const photoName = `${Date.now()}-${formData.email}.${photoExt}`;
      const { error: photoError } = await supabase.storage
        .from(BUCKET_NAME) // Using the exact bucket name
        .upload(`photos/${photoName}`, photoFile);
      
      if (photoError) throw new Error('Photo upload failed: ' + photoError.message);
      
      const { data: photoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`photos/${photoName}`);

      // 2. Upload Video
      const videoExt = videoFile.name.split('.').pop();
      const videoName = `${Date.now()}-${formData.email}.${videoExt}`;
      const { error: videoError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`videos/${videoName}`, videoFile);
      
      if (videoError) throw new Error('Video upload failed: ' + videoError.message);
      
      const { data: videoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${videoName}`);

      setUploading(false);

      // 3. Trigger Paystack
      if (!window.PaystackPop) throw new Error('Paystack is loading. Please try again.');

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: formData.email,
        amount: 2000 * 100, // ₦2,000
        currency: 'NGN',
        ref: `REG-${Date.now()}`,
        metadata: {
          type: 'registration',
          full_name: formData.full_name,
          stage_name: formData.stage_name,
          phone: formData.phone,
          church: formData.church,
          category: formData.category,
          bio: formData.bio,
          photo_url: photoData.publicUrl,
          video_url: videoData.publicUrl,
          dob: formData.dob,
        },
        callback: function (response: any) {
          router.push('/register/success');
        },
        onClose: function () {
          setLoading(false);
          setErrorMsg('Payment cancelled. Registration incomplete.');
        }
      });
      handler.openIframe();

    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold">← Back to Home</Link>
        <span className="font-bold">Registration</span>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900">Apply to Compete</h1>
            <p className="text-gray-500 text-sm mt-2">Fill this form to register for TFTC 2027.</p>
            <div className="mt-4 inline-block bg-green-50 text-green-700 font-bold px-4 py-2 rounded-full text-sm">
              Registration Fee: ₦2,000
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="full_name" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Stage Name</label>
                <input type="text" name="stage_name" onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone (WhatsApp) *</label>
                <input type="tel" name="phone" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth *</label>
                <input type="date" name="dob" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Church Name *</label>
                <input type="text" name="church" required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
              <select name="category" onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white">
                <option>Singing</option>
                <option>Preaching</option>
                <option>Comedy / Skit</option>
                <option>Dance</option>
                <option>Instrumental</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo (JPG/PNG) *</label>
              <input type="file" accept="image/jpeg, image/png" required onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Talent Video (MP4, Max 2 mins) *</label>
              <input type="file" accept="video/mp4, video/quicktime" required onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Short Bio *</label>
              <textarea name="bio" required onChange={handleChange} rows={3} className="w-full p-3 border rounded-lg outline-none focus:border-black" placeholder="Tell us about yourself..."></textarea>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-black" />
                <span className="text-sm text-gray-600">
                  I have read and agree to the <strong>TFTC Content & Media Agreement</strong>. I understand the ₦2,000 registration fee is non-refundable.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 text-lg mt-4 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  {uploading ? 'Uploading Media...' : 'Connecting to Paystack...'}
                </>
              ) : (
                'Pay ₦2,000 & Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
