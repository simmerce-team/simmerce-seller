"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Category } from "./categories";

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
export async function getProducts(): Promise<ProductListItem[]> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth/login");
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (businessError || !userBusiness) {
      throw new Error("Business not found");
    }

    // Simplified query for list view with flat fields
    let query = supabase
      .from("products")
      .select(
        `
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
      `
      )
      .eq("business_id", userBusiness.business_id);

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }

    // Process products to create flat structure
    const processedProducts: ProductListItem[] = (products || []).map(
      (product: any) => {
        // Find primary image URL
        const primaryImageUrl =
          product.product_files?.find(
            (file: any) => file.is_primary && file.file_type === "image"
          )?.url ||
          product.product_files?.find((file: any) => file.file_type === "image")
            ?.url ||
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
      }
    );

    return processedProducts;
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Fetches a single product by ID for the current business (detailed view)
 */
export async function getProduct(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/auth/login");
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (businessError || !userBusiness) {
      throw new Error("Business not found");
    }

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
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
      `
      )
      .eq("id", productId)
      .eq("business_id", userBusiness.business_id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
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
    console.error("Error in getProduct:", error);
    return null;
  }
}

/**
 * Creates a new product for the current business
 */
export async function createProduct(productData: CreateProductInput): Promise<{
  success: boolean;
  data?: { id: string; slug: string };
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: "Business not found" };
    }

    // Generate slug from name
    const slug =
      productData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/--+/g, "-") // Replace multiple hyphens with single
        .trim() // Trim leading/trailing hyphens
        .slice(0, 100) +
      "-" +
      Math.random().toString(36).substring(2, 8); // Add random string for uniqueness

    // Insert the new product
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert([
        {
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
        },
      ])
      .select("id, slug")
      .single();

    if (insertError) {
      console.error("Error creating product:", insertError);
      return {
        success: false,
        error: insertError.message.includes("duplicate key")
          ? "A product with this name already exists"
          : "Failed to create product",
      };
    }

    return {
      success: true,
      data: {
        id: product.id,
        slug: product.slug,
      },
    };
  } catch (error) {
    console.error("Unexpected error in createProduct:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the product",
    };
  }
}

/**
 * Updates a product's details
 */
export async function updateProduct(
  productId: string,
  updateData: Partial<CreateProductInput> & { specifications?: any }
): Promise<{ success: boolean; data?: ProductDetail; error?: string }> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: "Business not found" };
    }

    // Prepare the update data
    const updatePayload: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", productId)
      .eq("business_id", userBusiness.business_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating product:", updateError);
      return { success: false, error: "Failed to update product" };
    }

    // If specifications were updated, handle them
    if (updateData.specifications !== undefined) {
      // Convert specifications to JSON string if it's an object
      const specificationsJson = typeof updateData.specifications === 'string' 
        ? updateData.specifications 
        : JSON.stringify(updateData.specifications);

      // Update the specifications in the database
      const { error: specError } = await supabase
        .from("products")
        .update({ 
          specifications: specificationsJson,
          updated_at: new Date().toISOString() 
        })
        .eq("id", productId);

      if (specError) {
        console.error("Error updating specifications:", specError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Fetch the updated product with all its relations
    const { data: fullProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        product_files(*)
      `)
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated product:", fetchError);
      return { 
        success: false, 
        error: "Product updated but there was an error fetching the updated data" 
      };
    }

    return { 
      success: true, 
      data: fullProduct as unknown as ProductDetail 
    };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

/**
 * Deletes a product and all associated files
 */
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get current user and business
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user's business
    const { data: userBusiness, error: businessError } = await supabase
      .from("user_businesses")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (businessError || !userBusiness) {
      return { success: false, error: "Business not found" };
    }

    // First, get all files associated with this product
    const { data: productFiles, error: filesError } = await supabase
      .from("product_files")
      .select("id, url")
      .eq("product_id", productId);

    if (filesError) {
      console.error("Error fetching product files:", filesError);
      return { success: false, error: "Failed to fetch product files" };
    }

    // Delete the product record (this will cascade delete the product_files due to foreign key)
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("business_id", userBusiness.business_id);

    if (deleteError) {
      console.error("Error deleting product:", deleteError);
      return { success: false, error: "Failed to delete product" };
    }

    // If we have files to delete, remove them from storage
    if (productFiles && productFiles.length > 0) {
      // Extract file paths from URLs
      const filePaths = productFiles
        .map(file => {
          try {
            const url = new URL(file.url);
            // Remove the leading slash from pathname if it exists
            return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
          } catch (error) {
            console.error("Error parsing file URL:", file.url, error);
            return null;
          }
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        // Delete files from storage
        const { error: storageError } = await supabase.storage
          .from("products") // Your bucket name
          .remove(filePaths);

        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
          // We don't return here as the product is already deleted
          // Just log the error and continue
        }
      }

      // Delete file records from database
      const fileIds = productFiles.map(file => file.id);
      const { error: deleteFilesError } = await supabase
        .from("product_files")
        .delete()
        .in("id", fileIds);

      if (deleteFilesError) {
        console.error("Error deleting file records:", deleteFilesError);
        // Continue even if this fails as the product is already deleted
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
