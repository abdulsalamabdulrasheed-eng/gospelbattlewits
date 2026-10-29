'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, X } from 'lucide-react';

declare global { interface Window { PaystackPop: any; } }
const BUCKET_NAME = 'contestants media';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const [modal, setModal] = useState({ show: false, title: '', message: '', isError: false });

  const [formData, setFormData] = useState({
    full_name: '', stage_name: '', email: '', phone: '', church: '', dob: '', category: 'Singing', bio: '',
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // Three Checkboxes
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMedia, setAgreeMedia] = useState(false);
  const [agreeNewsletter, setAgreeNewsletter] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
    const error = searchParams.get('error');
    if (error === 'invalid_credentials' || error === 'no_account') {
      showModal('Notice', 'Your credentials were not found. Please register below.', true);
    }
  }, [searchParams]);

  const checkRegistrationStatus = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'registration_open').maybeSingle();
    if (data && data.value === false) setIsClosed(true);
  };

  const showModal = (title: string, message: string, isError = false) => {
    setModal({ show: true, title, message, isError });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        return showModal('File Too Large', 'Your video is larger than 50MB. Please upload a smaller file.', true);
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    return new Date(difference).getUTCFullYear() - 1970;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.phone || !formData.dob) {
        return showModal('Missing Details', 'Please fill all required fields in Step 1.', true);
      }
      if (calculateAge(formData.dob) < 18) {
        return showModal('Age Restriction', 'You must be 18 or older to register.', true);
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.church || !photoFile || !videoFile || !formData.bio) {
        return showModal('Missing Details', 'Please upload your media and fill the bio in Step 2.', true);
      }
      setStep(3);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed) return showModal('Registration Closed', 'The registration portal is currently closed.', true);
    if (!agreeTerms || !agreeMedia) return showModal('Agreement Required', 'You must agree to the Terms and Media Agreement.', true);

    setLoading(true);
    try {
      setUploading(true);
      
      const photoExt = photoFile!.name.split('.').pop();
      const photoName = `${Date.now()}-${formData.email}.${photoExt}`;
      const { error: photoError } = await supabase.storage.from(BUCKET_NAME).upload(`photos/${photoName}`, photoFile!);
      if (photoError) throw new Error('Photo upload failed: ' + photoError.message);
      const { data: photoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`photos/${photoName}`);

      const videoExt = videoFile!.name.split('.').pop();
      const videoName = `${Date.now()}-${formData.email}.${videoExt}`;
      const { error: videoError } = await supabase.storage.from(BUCKET_NAME).upload(`videos/${videoName}`, videoFile!);
      if (videoError) throw new Error('Video upload failed: ' + videoError.message);
      const { data: videoData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${videoName}`);

      setUploading(false);
      if (!window.PaystackPop) throw new Error('Paystack is loading. Please refresh and try again.');

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: formData.email,
        amount: 2000 * 100,
        currency: 'NGN',
        ref: `REG-${Date.now()}`,
        metadata: { type: 'registration', newsletter_optin: agreeNewsletter },
        callback: function (response: any) {
          fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formData: { ...formData, newsletter_optin: agreeNewsletter },
              photoUrl: photoData.publicUrl,
              videoUrl: videoData.publicUrl,
              reference: response.reference,
            }),
          })
          .then(res => res.json())
          .then(async (data) => {
            if (data.error) throw new Error(data.error);
            const { error: loginError } = await supabase.auth.signInWithPassword({ 
              email: formData.email.trim(), 
              password: data.tempPassword 
            });
            if (loginError) throw new Error("Auto-login failed: " + loginError.message);
            window.location.href = '/contestant/set-password';
          })
          .catch(err => {
            showModal('Error', 'Payment succeeded but save failed: ' + err.message, true);
            setLoading(false);
          });
        },
        onClose: function () { 
          setLoading(false); 
          showModal('Payment Cancelled', 'Registration was not completed.', true); 
        }
      });
      handler.openIframe();
    } catch (error: any) {
      showModal('Error', error.message, true);
      setLoading(false);
      setUploading(false);
    }
  };

  if (isClosed) return <div className="min-h-screen flex items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"><h1 className="text-2xl font-black mb-2">Registration Closed</h1><p className="text-gray-500 mb-6">The portal is no longer accepting applications.</p><Link href="/" className="block w-full bg-black text-white font-bold py-3 rounded-lg">Return Home</Link></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
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

      <div className="bg-black text-white p-4 flex justify-between items-center">
        <Link href="/" className="text-sm font-bold">← Back to Home</Link>
        <span className="font-bold">Registration</span>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900">Apply to Compete</h1>
            <p className="text-gray-500 text-sm mt-2">You are highly expected. Good luck!</p>
          </div>

          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black z-0 transition-all" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            {[1, 2, 3].map((num) => (
              <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= num ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label><input type="text" name="full_name" value={formData.full_name} required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Stage Name</label><input type="text" name="stage_name" value={formData.stage_name} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={formData.phone} required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth *</label><input type="date" name="dob" value={formData.dob} required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                <div className="text-center mt-6"><button type="button" onClick={nextStep} className="w-full bg-black text-white font-bold py-4 rounded-xl">Continue</button></div>
                <div className="text-center text-sm">Already have an account? <Link href="/login" className="font-bold underline">Login</Link></div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Church *</label><input type="text" name="church" value={formData.church} required onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Category *</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:border-black bg-white"><option>Singing</option><option>Preaching</option><option>Comedy / Skit</option><option>Dance</option><option>Instrumental</option></select></div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                    {photoPreview ? (
                      <div className="relative">
                        <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-white shadow-md" />
                        <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-0 right-1/3 bg-red-100 text-red-600 p-1 rounded-full"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="cursor-pointer">
                        <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 font-semibold">Click to upload photo</p>
                      </div>
                    )}
                    <input type="file" accept="image/jpeg, image/png" required onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Talent Video (MP4) *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                    {videoPreview ? (
                      <div>
                        <video src={videoPreview} controls className="w-full h-32 rounded-lg object-cover mb-2 bg-black" />
                        <button type="button" onClick={() => { setVideoFile(null); setVideoPreview(null); }} className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Remove Video</button>
                      </div>
                    ) : (
                      <div className="cursor-pointer">
                        <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 font-semibold">Click to upload video (Max 2 mins)</p>
                      </div>
                    )}
                    <input type="file" accept="video/mp4, video/quicktime" required onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>

                <div><label className="block text-sm font-bold text-gray-700 mb-1">Short Bio *</label><textarea name="bio" value={formData.bio} required onChange={handleChange} rows={3} className="w-full p-3 border rounded-lg outline-none focus:border-black"></textarea></div>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 text-black font-bold py-4 rounded-xl">Back</button>
                  <button type="button" onClick={nextStep} className="flex-1 bg-black text-white font-bold py-4 rounded-xl">Review</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <h3 className="font-bold mb-2 border-b pb-2">Application Summary</h3>
                  <p className="text-sm"><strong>Name:</strong> {formData.full_name} {formData.stage_name && `(${formData.stage_name})`}</p>
                  <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
                  <p className="text-sm"><strong>Church:</strong> {formData.church}</p>
                  <p className="text-sm"><strong>Category:</strong> {formData.category}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center mb-4">
                  <p className="text-sm font-bold text-green-800">Registration Fee</p>
                  <p className="text-3xl font-black text-green-700">₦2,000</p>
                </div>
                
                {/* Three Checkboxes */}
                <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 w-5 h-5 accent-black" />
                    <span className="text-sm text-gray-600">I agree to the <Link href="/terms" target="_blank" className="underline font-bold">Terms & Conditions</Link>.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeMedia} onChange={(e) => setAgreeMedia(e.target.checked)} className="mt-1 w-5 h-5 accent-black" />
                    <span className="text-sm text-gray-600">I agree to the <Link href="/media-agreement" target="_blank" className="underline font-bold">TMTC Content & Media Agreement</Link>.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <input type="checkbox" checked={agreeNewsletter} onChange={(e) => setAgreeNewsletter(e.target.checked)} className="mt-1 w-5 h-5 accent-black" />
                    <span className="text-sm text-blue-800">I want to receive marketing and newsletter updates (vote reminders, show news).</span>
                  </label>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 text-black font-bold py-4 rounded-xl">Back</button>
                  <button type="submit" disabled={loading} className="flex-[2] bg-black text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
                    {loading ? (uploading ? 'Uploading...' : 'Connecting...') : 'Pay ₦2,000 & Submit'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
