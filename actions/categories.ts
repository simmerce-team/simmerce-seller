'use server';

import { createClient } from '@/utils/supabase/server';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, icon_url, parent_id, created_at, updated_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data as Category[];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}
