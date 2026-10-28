import { supabase } from './supabase';

export const logAdminAction = async (action: string, target: string, details: string) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Audit Log Failed: No authenticated user.', authError);
      return;
    }

    const { error } = await supabase.from('admin_logs').insert({
      admin_email: user.email,
      action,
      target,
      details,
    });

    if (error) {
      console.error('Audit Log Insert Failed:', error.message);
    } else {
      console.log(`✅ Audit Log: ${action} on ${target}`);
    }
  } catch (err) {
    console.error('Audit Log Exception:', err);
  }
};
