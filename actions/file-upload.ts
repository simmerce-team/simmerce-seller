'use server';

import { ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE, MAX_IMAGE_SIZE, MAX_IMAGES, MAX_PDF_SIZE } from '@/utils/constant';
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

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

type FileUploadOptions = {
  isPrimary?: boolean;
  isUpdate?: boolean;
  maxConcurrent?: number;
};

// Utility functions for better code organization
const validateFileType = (file: File, fileType: FileType): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (fileType === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid image type. Please upload a JPEG, PNG, or WebP image.' 
    };
  }

  if (fileType === 'pdf' && file.type !== ALLOWED_PDF_TYPE) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please upload a PDF file.' 
    };
  }

  return { isValid: true };
};

const validateFileSize = (file: File, fileType: FileType): ValidationResult => {
  const maxSize = fileType === 'pdf' ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { 
      isValid: false, 
      error: `${fileType.toUpperCase()} size too large. Maximum size is ${maxSizeMB}MB.` 
    };
  }

  return { isValid: true };
};

const generateUniqueFilePath = (productId: string, fileName: string, fileType: FileType): string => {
  const fileExt = fileName.split('.').pop();
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const uniqueFileName = `${productId}/${timestamp}-${randomSuffix}.${fileExt}`;
  return `${fileType === 'image' ? 'images' : 'docs'}/${uniqueFileName}`;
};

const extractFilePathFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex((part: string) => part === 'products');
  
  if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
    throw new Error('Invalid file URL format');
  }
  
  return urlParts.slice(bucketIndex + 1).join('/');
};

/**
 * Validates file constraints for a product
 */
const validateProductFileConstraints = async (
  supabase: any,
  productId: string,
  fileType: FileType,
  isUpdate: boolean = false
): Promise<ValidationResult> => {
  try {
    if (fileType === 'image') {
      const { data: existingImages, error: countError } = await supabase
        .from('product_files')
        .select('id', { count: 'exact' })
        .eq('product_id', productId)
        .eq('file_type', 'image');

      if (countError) {
        return { isValid: false, error: countError.message };
      }
      
      if ((existingImages?.length || 0) >= MAX_IMAGES && !isUpdate) {
        return { 
          isValid: false, 
          error: `Maximum of ${MAX_IMAGES} images allowed per product.` 
        };
      }
    }

    if (fileType === 'pdf') {
      const { data: existingPdf, error: pdfError } = await supabase
        .from('product_files')
        .select('id')
        .eq('product_id', productId)
        .eq('file_type', 'pdf')
        .maybeSingle();

      if (pdfError) {
        return { isValid: false, error: pdfError.message };
      }

      if (existingPdf && !isUpdate) {
        return { 
          isValid: false, 
          error: 'A PDF already exists for this product. Please delete it before uploading a new one.' 
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
};

/**
 * Uploads a product file (image or PDF) to storage and associates it with a product
 * @param productId - The ID of the product to associate the file with
 * @param file - The file to upload
 * @param fileType - The type of file ('image' or 'pdf')
 * @param options - Optional configuration
 * @returns The uploaded file data or an error
 */
export async function uploadProductFile(
  productId: string,
  file: File,
  fileType: FileType,
  options: FileUploadOptions = {}
): Promise<UploadResult> {
  const supabase = await createClient();
  const { isPrimary = false, isUpdate = false } = options;

  try {
    // Validate file type
    const typeValidation = validateFileType(file, fileType);
    if (!typeValidation.isValid) {
      return { data: null, error: typeValidation.error! };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, fileType);
    if (!sizeValidation.isValid) {
      return { data: null, error: sizeValidation.error! };
    }

    // Validate product constraints
    const constraintValidation = await validateProductFileConstraints(
      supabase, 
      productId, 
      fileType, 
      isUpdate
    );
    if (!constraintValidation.isValid) {
      return { data: null, error: constraintValidation.error! };
    }

    // Generate unique file path
    const filePath = generateUniqueFilePath(productId, file.name, fileType);

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { 
        upsert: isUpdate,
        contentType: file.type 
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    // Handle PDF update case
    if (fileType === 'pdf' && isUpdate) {
      const { data: existingPdf } = await supabase
        .from('product_files')
        .select('id, url')
        .eq('product_id', productId)
        .eq('file_type', 'pdf')
        .maybeSingle();

      if (existingPdf) {
        // Clean up old file from storage
        try {
          const oldFilePath = extractFilePathFromUrl(existingPdf.url);
          await supabase.storage
            .from('products')
            .remove([oldFilePath]);
        } catch (cleanupError) {
          console.warn('Failed to cleanup old PDF file:', cleanupError);
        }

        const { data, error } = await supabase
          .from('product_files')
          .update({
            url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPdf.id)
          .select()
          .single();

        if (error) throw new Error(`Database update failed: ${error.message}`);
        return { data, error: null };
      }
    }

    // Insert new file record
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

    if (error) {
      // Cleanup uploaded file if database insert fails
      try {
        await supabase.storage
          .from('products')
          .remove([filePath]);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file after database error:', cleanupError);
      }
      throw new Error(`Database insert failed: ${error.message}`);
    }

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
 * Uploads multiple product images with improved concurrency and error handling
 * @param productId - The ID of the product to associate the images with
 * @param files - Array of image files to upload
 * @param options - Optional configuration
 * @returns The uploaded images data or an error
 */
export async function uploadProductImages(
  productId: string,
  files: File[],
  options: FileUploadOptions = {}
): Promise<UploadResult> {
  const { isUpdate = false, maxConcurrent = 3 } = options;
  
  // Filter out any null/undefined files and validate count
  const validFiles = files.filter(Boolean);
  
  if (validFiles.length === 0) {
    return { data: [], error: null };
  }

  if (validFiles.length > MAX_IMAGES) {
    return {
      data: null,
      error: `Maximum of ${MAX_IMAGES} images allowed per product.`
    };
  }

  const supabase = await createClient();

  try {
    // Pre-validate constraints once
    const constraintValidation = await validateProductFileConstraints(
      supabase, 
      productId, 
      'image', 
      isUpdate
    );
    if (!constraintValidation.isValid) {
      return { data: null, error: constraintValidation.error! };
    }

    // Process files in batches for better performance
    const results: ProductFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < validFiles.length; i += maxConcurrent) {
      const batch = validFiles.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (file, index) => {
        const globalIndex = i + index;
        return uploadProductFile(productId, file, 'image', {
          isPrimary: globalIndex === 0, // First image is primary
          isUpdate
        });
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          if (result.value.error) {
            errors.push(result.value.error);
          } else if (result.value.data) {
            const fileData = Array.isArray(result.value.data) 
              ? result.value.data[0] 
              : result.value.data;
            results.push(fileData);
          }
        } else {
          errors.push(`Upload failed: ${result.reason}`);
        }
      }
    }

    // If any errors occurred, clean up successful uploads and return error
    if (errors.length > 0) {
      if (results.length > 0) {
        console.warn('Cleaning up successful uploads due to batch errors');
        await Promise.allSettled(
          results.map(file => 
            deleteProductFile(file.id).catch(console.error)
          )
        );
      }
      return { 
        data: null, 
        error: `Upload failed: ${errors[0]}` 
      };
    }

    return { data: results, error: null };
  } catch (error) {
    console.error('Error uploading images:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to upload images'
    };
  }
}

/**
 * Deletes a product file from storage and database with improved error handling
 * @param fileId - The ID of the file to delete
 */
export async function deleteProductFile(fileId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  
  try {
    // First get the file record
    const { data: file, error: fetchError } = await supabase
      .from('product_files')
      .select('*')
      .eq('id', fileId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch file record: ${fetchError.message}`);
    }
    
    if (!file) {
      return { error: 'File not found' };
    }

    // Extract file path and delete from storage
    let storageDeleted = false;
    try {
      const filePath = extractFilePathFromUrl(file.url);
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      } else {
        storageDeleted = true;
      }
    } catch (pathError) {
      console.error('Failed to extract file path:', pathError);
    }

    // Delete from database (proceed even if storage deletion failed)
    const { error: dbError } = await supabase
      .from('product_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    if (!storageDeleted) {
      console.warn(`File ${fileId} deleted from database but may still exist in storage`);
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete file'
    };
  }
}

/**
 * Gets all files for a product with improved error handling and sorting
 * @param productId - The ID of the product
 */
export async function getProductFiles(productId: string): Promise<{ data: ProductFile[] | null; error: string | null }> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch product files: ${error.message}`);
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching product files:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch product files'
    };
  }
}

/**
 * Bulk delete multiple product files with optimized performance
 * @param fileIds - Array of file IDs to delete
 */
export async function deleteProductFiles(fileIds: string[]): Promise<{ 
  success: string[]; 
  failed: Array<{ id: string; error: string }>; 
}> {
  if (fileIds.length === 0) {
    return { success: [], failed: [] };
  }

  const results = await Promise.allSettled(
    fileIds.map(async (fileId) => {
      const result = await deleteProductFile(fileId);
      return { fileId, result };
    })
  );

  const success: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { fileId, result: deleteResult } = result.value;
      if (deleteResult.error) {
        failed.push({ id: fileId, error: deleteResult.error });
      } else {
        success.push(fileId);
      }
    } else {
      failed.push({ 
        id: fileIds[index], 
        error: `Delete operation failed: ${result.reason}` 
      });
    }
  });

  return { success, failed };
}
