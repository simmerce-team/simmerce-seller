"use server";

import { createClient } from "@/utils/supabase/server";
import slug from "slug";

export async function getUniqueSlug(tablename: string, text: string): Promise<string> {
    const baseSlug = slug(text);
    let uniqueSlug = baseSlug;
    let counter = 1;
    const supabase = await createClient();
  
    // Keep trying until we find a unique slug
    while (true) {
      const { data, error } = await supabase
        .from(tablename)
        .select('slug')
        .eq('slug', uniqueSlug)
        .single();
  
      // If there's an error or no existing record with this slug, it's unique
      if (error?.code === 'PGRST116' || !data) {
        return uniqueSlug;
      }
  
      // If we get here, the slug exists - try with an incremented counter
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }