'use server';

import { createClient } from '@/utils/supabase/server';

type FileType = 'image' | 'pdf';

type ProductFile = {
  id: string;
  product_id: string;
  url: string;
  file_type: FileType;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
};

type UploadResult = {
  data: ProductFile | ProductFile[] | null;
  error: string | null;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_IMAGES = 3;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const ALLOWED_PDF_TYPE = 'application/pdf';

/**
 * Uploads a product file (image or PDF) to storage and associates it with a product
 * @param productId - The ID of the product to associate the file with
 * @param file - The file to upload
 * @param fileType - The type of file ('image' or 'pdf')
 * @param options - Optional configuration
 * @param options.isPrimary - Whether this file should be marked as primary
 * @param options.isUpdate - Whether this is an update to an existing product
 * @returns The uploaded file data or an error
 */
export async function uploadProductFile(
  productId: string,
  file: File,
  fileType: FileType,
  options: { isPrimary?: boolean; isUpdate?: boolean } = {}
): Promise<UploadResult> {
  const supabase = await createClient();
  const { isPrimary = false, isUpdate = false } = options;

  try {
    // Validate input
    if (!file) {
      throw new Error('No file provided');
    }

    if (fileType === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid image type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (fileType === 'pdf' && file.type !== ALLOWED_PDF_TYPE) {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    const maxSize = fileType === 'pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`${fileType.toUpperCase()} size too large. Maximum size is ${maxSizeMB}MB.`);
    }

    // Check if we've reached the maximum number of images
    if (fileType === 'image') {
      const { data: existingImages, error: countError } = await supabase
        .from('product_files')
        .select('id', { count: 'exact' })
        .eq('product_id', productId)
        .eq('file_type', 'image');

      if (countError) throw countError;
      
      if ((existingImages?.length || 0) >= MAX_IMAGES) {
        throw new Error(`Maximum of ${MAX_IMAGES} images allowed per product.`);
      }
    }

    // Check if a PDF already exists for this product
    if (fileType === 'pdf') {
      const { data: existingPdf, error: pdfError } = await supabase
        .from('product_files')
        .select('id')
        .eq('product_id', productId)
        .eq('file_type', 'pdf')
        .single();

      if (pdfError && !pdfError.details?.includes('0 rows')) {
        throw pdfError;
      }

      if (existingPdf && !isUpdate) {
        throw new Error('A PDF already exists for this product. Please delete it before uploading a new one.');
      }
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileType === 'image' ? 'images' : 'docs'}/${fileName}`;

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { upsert: isUpdate });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    // If this is an update and a PDF, update the existing record
    if (fileType === 'pdf' && isUpdate) {
      const { data: existingPdf } = await supabase
        .from('product_files')
        .select('id')
        .eq('product_id', productId)
        .eq('file_type', 'pdf')
        .single();

      if (existingPdf) {
        const { data, error } = await supabase
          .from('product_files')
          .update({
            url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPdf.id)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    }

    // Insert the file record into the database
    const { data, error } = await supabase
      .from('product_files')
      .insert([
        {
          product_id: productId,
          url: publicUrl,
          file_type: fileType,
          is_primary: isPrimary
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

/**
 * Uploads multiple product images to storage and associates them with a product
 * @param productId - The ID of the product to associate the images with
 * @param files - Array of image files to upload
 * @param options - Optional configuration
 * @returns The uploaded images data or an error
 */
export async function uploadProductImages(
  productId: string,
  files: File[],
  options: { isUpdate?: boolean } = {}
): Promise<UploadResult> {
  const results: ProductFile[] = [];
  
  // Filter out any null/undefined files
  const validFiles = files.filter(Boolean);
  
  // Check if we're within the limit
  if (validFiles.length > MAX_IMAGES) {
    return {
      data: null,
      error: `Maximum of ${MAX_IMAGES} images allowed per product.`
    };
  }

  // Upload each file
  for (const file of validFiles) {
    const result = await uploadProductFile(productId, file, 'image', {
      isPrimary: results.length === 0, // First image is primary
      isUpdate: options.isUpdate
    });

    if (result.error) {
      // If any upload fails, clean up the successful ones
      if (results.length > 0) {
        await Promise.all(
          results.map(file => 
            deleteProductFile(file.id).catch(console.error)
          )
        );
      }
      return result;
    }

    if (result.data) {
      results.push(Array.isArray(result.data) ? result.data[0] : result.data);
    }
  }

  return { data: results, error: null };
}

/**
 * Deletes a product file from storage and database
 * @param fileId - The ID of the file to delete
 */
export async function deleteProductFile(fileId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  
  try {
    // First get the file record to delete from storage
    const { data: file, error: fetchError } = await supabase
      .from('product_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;
    if (!file) return { error: 'File not found' };

    // Extract the correct file path from the public URL
    // Supabase public URLs have format: https://[project].supabase.co/storage/v1/object/public/products/[filepath]
    const urlParts = file.url.split('/');
    const bucketIndex = urlParts.findIndex((part: string) => part === 'products');
    
    if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
      throw new Error('Invalid file URL format');
    }
    
    // Get everything after the bucket name as the file path
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('products')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
      // This prevents orphaned database records
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('product_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
}

/**
 * Gets all files for a product
 * @param productId - The ID of the product
 */
export async function getProductFiles(productId: string): Promise<{ data: ProductFile[] | null; error: string | null }> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product files:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch product files'
    };
  }
}
