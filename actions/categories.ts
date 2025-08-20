'use server';

import { createClient } from '@/utils/supabase/server';

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCategories() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as Category[];
}
