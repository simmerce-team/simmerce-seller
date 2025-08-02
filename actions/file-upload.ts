'use server';

import { createClient } from '@/utils/supabase/server';

type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
};

type UploadResult = {
  data: ProductImage | null;
  error: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

/**
 * Uploads a product image to storage and associates it with a product
 * @param productId - The ID of the product to associate the image with
 * @param file - The image file to upload
 * @param options - Optional configuration
 * @param options.isUpdate - Whether this is an update to an existing product
 * @returns The uploaded image data or an error
 */
export async function uploadProductImage(
  productId: string, 
  file: File,
  options: { isUpdate?: boolean } = {}
): Promise<UploadResult> {
  const supabase = await createClient();
  const { isUpdate = false } = options;

  try {
    // Validate input
    if (!file) {
      throw new Error('No image file provided');
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Image size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
    }

    // Check for existing images if this is an update
    let existingImage: { id: string; url?: string } | null = null;
    
    if (isUpdate) {
      const { data: existingImageData, error: fetchError } = await supabase
        .from('product_images')
        .select('id, url')
        .eq('product_id', productId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing images:', fetchError);
        throw new Error('Failed to check for existing product images');
      }
      existingImage = existingImageData;
    }

    // Generate unique filename and path
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${productId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${productId}/${fileName}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
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

    let imageData;

    if (existingImage) {
      // Update existing image
      const { data: updatedImage, error: updateError } = await supabase
        .from('product_images')
        .update({
          url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingImage.id)
        .select()
        .single();

      if (updateError) throw updateError;
      imageData = updatedImage;

      // Clean up old image from storage if it exists
      if (existingImage.url) {
        const oldFileName = existingImage.url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('product-images')
            .remove([`products/${productId}/${oldFileName}`])
            .catch(cleanupError => 
              console.error('Failed to clean up old image:', cleanupError)
            );
        }
      }
    } else {
      // Insert new image
      const { data: newImage, error: insertError } = await supabase
        .from('product_images')
        .insert([
          {
            product_id: productId,
            url: publicUrl,
            is_primary: true,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      imageData = newImage;
    }

    return { data: imageData, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload product image';
    console.error('Error in uploadProductImage:', error);
    return { 
      data: null, 
      error: errorMessage 
    };
  }
}
