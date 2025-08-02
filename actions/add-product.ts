'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkDuplicateProduct(name: string, businessId: string, excludeId?: string) {
  const supabase = await createClient();
  
  try {
    let query = supabase
      .from('products')
      .select('id')
      .eq('business_id', businessId)
      .ilike('name', name.trim());
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) throw error;
    return !!data; // returns true if duplicate found
  } catch (error) {
    console.error('Error checking for duplicate product:', error);
    throw error;
  }
}

export type AddProductInput = {
  name: string;
  description: string;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
  is_active?: boolean;
  category_id?: string | null;
};

export async function addProduct(productData: AddProductInput) {
  const supabase = await createClient();

  try {
    // Get the current user's business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Authentication failed. Please log in again.');
    }

    // Get the user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id, role')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      console.error('Business lookup error:', businessError);
      throw new Error('Unable to find your business account. Please contact support if this issue persists.');
    }

    // Prepare product data
    const productToInsert = {
      ...productData,
      business_id: userBusiness.business_id,
      is_active: productData.is_active ?? true,
      view_count: 0,
      enquiry_count: 0,
    };

    // Insert product
    const { data: product, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      throw new Error('Failed to create product. Please check your input and try again.');
    }

    revalidatePath('/products');
    return { success: true, data: product, error: null };
  } catch (error) {
    console.error('Error adding product:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to add product' 
    };
  }
}