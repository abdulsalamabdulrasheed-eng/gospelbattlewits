import { supabase } from './supabase';

export const logAdminAction = async (action: string, target: string, details: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found for audit log');
      return;
    }

    const { error } = await supabase.from('admin_logs').insert({
      admin_email: user.email,
      action,
      target,
      details,
    });

    if (error) {
      console.error('Audit log insert failed:', error.message);
    } else {
      console.log(`Audit Log: ${action} on ${target}`);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
  }
};
