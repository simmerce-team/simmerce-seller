'use server';

import { createClient } from '@/utils/supabase/server';
import { Product } from '../app/(protected)/(main)/products/[id]/types';

export async function getProductById(id: string): Promise<{ data: Product | null; error: string | null }> {
  const supabase = await createClient();
  
  try {
    // First, verify the Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { data: null, error: 'Database connection error' };
    }

    
    // Get the product with related data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*),
        business:businesses(*)
      `)
      .eq('id', id)
      .single();


    if (productError) {
      console.error('Supabase query error:', productError);
      throw productError;
    }
    
    if (!product) {
      return { data: null, error: 'Product not found' };
    }

    return { data: product as unknown as Product, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch product' 
    };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}
