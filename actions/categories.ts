"use server";

import { createClient } from "@/utils/supabase/server";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}
