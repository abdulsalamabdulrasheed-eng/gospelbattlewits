import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shrmqynkkziwvcqwpuvl.supabase.co';
// Paste your actual ANON KEY below
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocm1xeW5ra3ppd3ZjcXdwdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzEzNDcsImV4cCI6MjEwODMwNzM0N30.u-uE5lSedck0qrKq7ZEkSMtVQCvIpeqcTB2fF3vycb8'; 

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // This workaround bypasses the browser's Web Locks API
    // which can deadlock on mobile devices (e.g., Chrome Android).
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
