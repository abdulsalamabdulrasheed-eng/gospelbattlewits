import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (event === 'charge.success') {
      const reference = data.reference;
      const metadata = data.metadata;
      const amountInKobo = data.amount;

      // Check if it's a registration payment
      if (metadata?.type === 'registration') {
        
        // Generate the next sequential Contestant ID (e.g., TFTC-0001)
        const { count } = await supabaseAdmin
          .from('contestants')
          .select('*', { count: 'exact', head: true });
        
        const nextNumber = (count || 0) + 1;
        const contestantId = `TFTC-${nextNumber.toString().padStart(4, '0')}`;

        // Insert the contestant into the database
        const { error: insertError } = await supabaseAdmin
          .from('contestants')
          .insert({
            contestant_id: contestantId,
            full_name: metadata.full_name,
            stage_name: metadata.stage_name,
            email: data.customer.email,
            phone: metadata.phone,
            church: metadata.church,
            category: metadata.category,
            bio: metadata.bio,
            photo_url: metadata.photo_url,
            video_url: metadata.video_url,
            status: 'pending', // Admin must approve before they go live
            total_votes: 0,
          });

        if (insertError) {
          console.error('Failed to insert contestant:', insertError);
          throw insertError;
        }

        // Log the transaction
        await supabaseAdmin.from('transactions').insert({
          reference: reference,
          voter_email: data.customer.email,
          amount: amountInKobo,
          votes_credited: 0,
          status: 'success',
        });

        return NextResponse.json({ success: true, contestantId }, { status: 200 });
      }

      // Check if it's a voting payment
      if (metadata?.contestant_id && metadata?.votes_to_credit) {
        const contestantId = metadata.contestant_id;
        const votesToCredit = metadata.votes_to_credit;

        // Idempotency check
        const { data: existingTx } = await supabaseAdmin
          .from('transactions')
          .select('id')
          .eq('reference', reference)
          .single();

        if (existingTx) return NextResponse.json({ message: 'Already processed' }, { status: 200 });

        // Insert into ledger
        await supabaseAdmin.from('transactions').insert({
          reference: reference,
          contestant_id: contestantId,
          voter_email: data.customer.email,
          amount: amountInKobo,
          votes_credited: votesToCredit,
          status: 'success'
        });

        // Increment votes
        await supabaseAdmin.rpc('increment_votes', {
          contestant_uuid: contestantId,
          votes_to_add: votesToCredit
        });

        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
