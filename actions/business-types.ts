"use server";

import { createClient } from "@/utils/supabase/server";

export interface BusinessType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBusinessTypes(): Promise<BusinessType[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_types")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching business types:", error);
    throw error;
  }

  return data as BusinessType[];
}
