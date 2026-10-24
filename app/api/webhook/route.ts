import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the SERVICE ROLE key here to bypass Row Level Security for the webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data } = body;

    // 1. Verify it's a successful charge
    if (event === 'charge.success') {
      const reference = data.reference;
      const amountInKobo = data.amount;
      const metadata = data.metadata;
      const contestantId = metadata?.contestant_id; 
      const votesToCredit = metadata?.votes_to_credit;
      const voterEmail = data.customer.email;

      if (!contestantId || !votesToCredit) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // 2. Check if this transaction was already processed (Idempotency)
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('reference', reference)
        .single();

      if (existingTx) {
        return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
      }

      // 3. Insert into the Vote Ledger
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          reference: reference,
          contestant_id: contestantId, // Assuming you store the UUID here, or look it up
          voter_email: voterEmail,
          amount: amountInKobo,
          votes_credited: votesToCredit,
          status: 'success'
        });

      if (txError) throw txError;

      // 4. Update the Contestant's Total Votes
      // We use a Postgres RPC function to ensure atomic updates (no race conditions)
      const { error: rpcError } = await supabaseAdmin.rpc('increment_votes', {
        contestant_uuid: contestantId,
        votes_to_add: votesToCredit
      });

      if (rpcError) throw rpcError;

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
