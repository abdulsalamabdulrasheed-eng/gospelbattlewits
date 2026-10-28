import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formData, photoUrl, videoUrl, reference } = body;

    if (!formData || !formData.email) {
      return NextResponse.json({ error: 'Invalid form data received.' }, { status: 400 });
    }

    // 1. Create Auth User
    const tempPassword = `TFTC-${Date.now()}-${Math.random().toString(36).slice(-4)}`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError && authError.message !== "A user with this email address has already been registered") {
      throw new Error('Auth creation failed: ' + authError.message);
    }

    // 2. Generate Contestant ID
    const { count } = await supabaseAdmin.from('contestants').select('*', { count: 'exact', head: true });
    const nextNumber = (count || 0) + 1;
    const contestantId = `TFTC-${nextNumber.toString().padStart(4, '0')}`;

    // 3. Insert Contestant (with proper fallbacks)
    const { error: insertError } = await supabaseAdmin.from('contestants').insert({
      contestant_id: contestantId,
      full_name: formData.full_name || 'Unknown Contestant', // Fallback
      stage_name: formData.stage_name || null,
      email: formData.email,
      phone: formData.phone || '0000000000', // Fallback
      church: formData.church || 'Unknown Church',
      category: formData.category || 'Singing',
      bio: formData.bio || 'No bio provided.',
      photo_url: photoUrl || '',
      video_url: videoUrl || '',
      status: 'pending',
      total_votes: 0,
      email_verified: false,
      phone_verified: false,
    });

    if (insertError) throw insertError;

    // 4. Log Transaction
    await supabaseAdmin.from('transactions').insert({
      reference: reference,
      voter_email: formData.email,
      amount: 2000 * 100,
      votes_credited: 0,
      status: 'success',
    });

    return NextResponse.json({ success: true, tempPassword });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
