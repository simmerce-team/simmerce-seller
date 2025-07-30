'use server';

import { createClient } from '@/utils/supabase/server';

export interface Product {
  id: string;
  name: string;
  description: any; // JSONB field
  price: number;
  compare_at_price: number | null;
  unit: string;
  moq: number;
  stock_quantity: number;
  sku: string | null;
  barcode: string | null;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  enquiry_count: number;
  created_at: string;
  updated_at: string;
  primary_image?: string;
}

export async function getSellerProducts() {
  const supabase = await createClient();

  try {
    // Get the current user's business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get the user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id, role')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      throw new Error('Business not found');
    }

    // Get products with primary image
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_images!left (
          url
        )
      `)
      .eq('business_id', userBusiness.business_id)
      .order('created_at', { ascending: false });

    if (productsError) {
      throw productsError;
    }

    // Process products to include primary image
    const processedProducts = products.map(product => ({
      ...product,
      primary_image: product.product_images?.[0]?.url || null
    }));

    return { 
      data: processedProducts as Product[], 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch products' 
    };
  }
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error toggling product status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product status' 
    };
  }
}
