import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const noOpLock = async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
  return await fn();
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    lock: noOpLock,
    lockAcquireTimeout: 0,
    persistSession: true,
    autoRefreshToken: true,
  },
});
