'use client';

import { createClient } from '../utils/supabase/client';

export async function refreshSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    console.error('Error refreshing session:', error);
    return { error };
  }
  
  return { data };
}
