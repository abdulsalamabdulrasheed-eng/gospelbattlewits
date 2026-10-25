import { createClient } from '@supabase/supabase-js';

// TEMPORARY HARDCODE - Replace with process.env once fixed
const supabaseUrl = 'https://shrmqynkkziwvcqwpuvl.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocm1xeW5ra3ppd3ZjcXdwdXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzEzNDcsImV4cCI6MjEwODMwNzM0N30.u-uE5lSedck0qrKq7ZEkSMtVQCvIpeqcTB2fF3vycb8'; // Your Anon Key

export const supabase = createClient(supabaseUrl, supabaseKey);