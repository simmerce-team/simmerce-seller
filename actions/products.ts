'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Simplified interface for products list (flat fields)
export interface ProductListItem {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
  view_count: number;
  enquiry_count: number;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Full interface for product details (with nested objects)
export interface ProductFile {
  id: string;
  url: string;
  file_type: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: any;
  category_id: string | null;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
  sku: string | null;
  is_active: boolean;
  view_count: number;
  enquiry_count: number;
  pdf_url: string | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
  category: Category | null;
  product_files: ProductFile[];
}

export interface ProductsResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
  category_id: string;
  sku?: string | null;
  is_active?: boolean;
}

/**
 * Fetches products for the current business with pagination, filtering, and sorting
 */
export async function getProducts(filters: ProductsFilters = {}): Promise<ProductsResponse> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      redirect('/auth/login');
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      throw new Error('Business not found');
    }

    const {
      search = '',
      category,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters;

    // Simplified query for list view with flat fields
    let query = supabase
      .from('products')
      .select(`
        id,
        business_id,
        name,
        slug,
        description,
        category_id,
        price,
        unit,
        moq,
        stock_quantity,
        sku,
        is_active,
        view_count,
        enquiry_count,
        created_at,
        updated_at,
        categories!inner(name),
        product_files!left(url, is_primary, file_type)
      `)
      .eq('business_id', userBusiness.business_id);

    // Apply filters with proper escaping
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }

    // Get total count for pagination with same filters applied
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', userBusiness.business_id);

    // Apply same filters to count query with proper escaping
    if (search && search.trim()) {
      const searchTerm = search.trim();
      countQuery = countQuery.or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`);
    }

    if (category) {
      countQuery = countQuery.eq('category_id', category);
    }

    if (typeof isActive === 'boolean') {
      countQuery = countQuery.eq('is_active', isActive);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting products count:', countError);
      throw new Error('Failed to get products count');
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }

    // Process products to create flat structure
    const processedProducts: ProductListItem[] = (products || []).map((product: any) => {
      // Find primary image URL
      const primaryImageUrl = product.product_files
        ?.find((file: any) => file.is_primary && file.file_type === 'image')?.url ||
        product.product_files
        ?.find((file: any) => file.file_type === 'image')?.url ||
        null;

      // Get category name
      const categoryName = product.categories?.name || null;

      return {
        id: product.id,
        business_id: product.business_id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        category_name: categoryName,
        price: product.price,
        unit: product.unit,
        moq: product.moq,
        stock_quantity: product.stock_quantity,
        sku: product.sku,
        is_active: product.is_active,
        view_count: product.view_count,
        enquiry_count: product.enquiry_count,
        primary_image_url: primaryImageUrl,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      products: processedProducts,
      total: count || 0,
      page,
      limit,
      totalPages
    };

  } catch (error) {
    console.error('Error in getProducts:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Fetches a single product by ID for the current business (detailed view)
 */
export async function getProduct(productId: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      redirect('/auth/login');
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      throw new Error('Business not found');
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        business_id,
        name,
        slug,
        description,
        specifications,
        category_id,
        price,
        unit,
        moq,
        stock_quantity,
        sku,
        is_active,
        view_count,
        enquiry_count,
        pdf_url,
        youtube_url,
        created_at,
        updated_at,
        category:categories(id, name, slug),
        product_files(id, url, file_type, alt_text, display_order, is_primary)
      `)
      .eq('id', productId)
      .eq('business_id', userBusiness.business_id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    if (!product) {
      return null;
    }

    return {
        ...product,
        category: product.category || null,
    } as unknown as ProductDetail;

  } catch (error) {
    console.error('Error in getProduct:', error);
    return null;
  }
}

/**
 * Creates a new product for the current business
 */
export async function createProduct(productData: CreateProductInput): Promise<{ 
  success: boolean; 
  data?: { id: string; slug: string }; 
  error?: string 
}> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: 'Business not found' };
    }

    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/--+/g, '-')      // Replace multiple hyphens with single
      .trim()                    // Trim leading/trailing hyphens
      .slice(0, 100) + '-' + Math.random().toString(36).substring(2, 8); // Add random string for uniqueness

    // Insert the new product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert([{
        business_id: userBusiness.business_id,
        name: productData.name.trim(),
        slug,
        description: productData.description.trim() || null,
        category_id: productData.category_id || null,
        price: productData.price,
        unit: productData.unit,
        moq: productData.moq,
        stock_quantity: productData.stock_quantity,
        sku: productData.sku?.trim() || null,
        is_active: productData.is_active ?? true,
      }])
      .select('id, slug')
      .single();

    if (insertError) {
      console.error('Error creating product:', insertError);
      return { 
        success: false, 
        error: insertError.message.includes('duplicate key') 
          ? 'A product with this name already exists' 
          : 'Failed to create product' 
      };
    }

    return { 
      success: true, 
      data: { 
        id: product.id, 
        slug: product.slug 
      } 
    };

  } catch (error) {
    console.error('Unexpected error in createProduct:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while creating the product' 
    };
  }
}

/**
 * Updates product status (active/inactive)
 */
export async function updateProductStatus(productId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: 'Business not found' };
    }

    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('business_id', userBusiness.business_id);

    if (error) {
      console.error('Error updating product status:', error);
      return { success: false, error: 'Failed to update product status' };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in updateProductStatus:', error);
    return { success: false, error: 'Failed to update product status' };
  }
}

/**
 * Deletes a product and all associated files
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from('user_businesses')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: 'Business not found' };
    }

    // Get product files for cleanup - ONLY for products belonging to this business
    const { data: productFiles } = await supabase
      .from('product_files')
      .select('url')
      .eq('product_id', productId)
      .in('product_id', [
        supabase
          .from('products')
          .select('id')
          .eq('business_id', userBusiness.business_id)
          .eq('id', productId)
      ]);

    // Delete the product (cascade will handle product_files)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('business_id', userBusiness.business_id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return { success: false, error: 'Failed to delete product' };
    }

    // Clean up storage files (best effort)
    if (productFiles && productFiles.length > 0) {
      for (const file of productFiles) {
        try {
          const urlParts = file.url.split('/');
          const bucketIndex = urlParts.findIndex((part: string) => part === 'products');
          if (bucketIndex !== -1) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            await supabase.storage.from('products').remove([filePath]);
          }
        } catch (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with other files
        }
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}
