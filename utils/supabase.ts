import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shrmqynkkziwvcqwpuvl.supabase.co';
// Paste your actual ANON KEY below
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocm1xeW5ra3ppd3ZjcXdwdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzEzNDcsImV4cCI6MjEwODMwNzM0N30.u-uE5lSedck0qrKq7ZEkSMtVQCvIpeqcTB2fF3vycb8'; 

// A no-op lock that immediately executes the function without acquiring a lock
const noOpLock = async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
  return await fn();
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    lock: noOpLock,
    lockAcquireTimeout: 0, // Forces the library to not wait for locks
    persistSession: true,
    autoRefreshToken: true,
  },
});
