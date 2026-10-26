import { supabase } from './supabase';

export const logAdminAction = async (action: string, target: string, details: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_logs').insert({
      admin_email: user.email,
      action,
      target,
      details,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
