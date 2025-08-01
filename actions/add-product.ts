'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type AddProductInput = {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  unit: string;
  moq: number;
  stock_quantity: number;
  sku?: string | null;
  barcode?: string | null;
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

export async function uploadProductImage(productId: string, file: File) {
  const supabase = await createClient();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  try {
    if (!file) {
      throw new Error('No image file provided');
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size too large. Maximum size is 5MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${productId}/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload image. Please try again.');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // Add the image to the product_images table
    const { data: imageData, error: imageError } = await supabase
      .from('product_images')
      .insert([
        {
          product_id: productId,
          image_url: publicUrl,
          is_primary: true,
        },
      ])
      .select()
      .single();

    if (imageError) {
      console.error('Database error:', imageError);
      // Attempt to clean up the uploaded file if database insert fails
      await supabase.storage
        .from('product-images')
        .remove([filePath])
        .catch(cleanupError => 
          console.error('Failed to clean up uploaded file:', cleanupError)
        );
      
      throw new Error('Failed to save image details. Please try again.');
    }

    return { data: imageData, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload product image';
    console.error('Error in uploadProductImage:', error);
    return { 
      data: null, 
      error: 'Failed to process image. Please try again.'
    };
  }
}
