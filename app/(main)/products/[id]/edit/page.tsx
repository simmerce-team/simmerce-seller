"use client";

import { checkDuplicateProduct } from "@/actions/add-product";
import { uploadProductImage } from "@/actions/file-upload";
import { getCategories } from "@/actions/get-categories";
import { updateProduct } from "@/actions/show-product";
import { ProductForm } from "@/components/product/product-form";
import { Button } from '@/components/ui/button';
import { useProduct } from "@/hooks/useProductQueries";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useState } from "react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

type Params = Promise<{ id: string }>;

export default function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const paramsData = use(params);

  // Fetch product data
  const { data: product, isLoading: isProductLoading } = useProduct(
    paramsData.id,
    true
  );
  

  // Set preview image when product is loaded
  useEffect(() => {
    if (product?.images?.[0]?.url) {
      setPreviewImage(product.images[0].url);
    }
  }, [product]);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    setIsImageChanged(true);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsPending(true);
    // Validate required fields
    if (!formData.name || !formData.price || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    startTransition(async () => {
      try {
        // Get the current user's business
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Authentication failed. Please log in again.');
        }

        // Get the user's business
        const { data: userBusiness } = await supabase
          .from('user_businesses')
          .select('business_id')
          .eq('user_id', user.id)
          .single();

        if (!userBusiness) {
          throw new Error('Unable to find your business account.');
        }

        // Check for duplicate product name within the same business (excluding current product)
        const isDuplicate = await checkDuplicateProduct(
          formData.name.trim(), 
          userBusiness.business_id,
          paramsData.id // Exclude current product from duplicate check
        );
        
        if (isDuplicate) {
          toast.error('A product with this name already exists in your business');
          return;
        }

        // Update the product
        const { error: updateError } = await updateProduct(
          paramsData.id,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price) || 0,
            unit: formData.unit,
            moq: parseInt(formData.moq) || 1,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            category_id: formData.category_id,
            is_active: formData.is_active,
          }
        );

        if (updateError) {
          throw new Error(updateError);
        }

        // If image was changed, upload the new one
        if (isImageChanged && selectedImage) {
          const { error: uploadError } = await uploadProductImage(
            paramsData.id,
            selectedImage,
            { isUpdate: true }
          );

          if (uploadError) {
            console.error('Image upload failed:', uploadError);
            toast.error('Product updated, but image upload failed');
          }
        } else if (isImageChanged && !selectedImage) {
          // Handle case where image was removed
          // You might want to implement image deletion logic here if needed
          toast.error('Image was removed');
        }

        setIsPending(false);
        toast.success('Product updated successfully!');
        router.push(`/products/${paramsData.id}`);
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update product');
      }
    });
  };

  if (isProductLoading || isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/products')}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="md:text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update your product details</p>
      </div>
      
      <ProductForm
        initialData={{
          name: product.name,
          description: product.description || '',
          price: product.price?.toString() || '',
          unit: product.unit,
          moq: (product.moq || 1).toString(),
          stock_quantity: (product.stock_quantity || 0).toString(),
          category_id: product.category_id || '',
          is_active: product.is_active ?? true,
        }}
        categories={categories}
        isPending={isPending}
        onSubmit={handleSubmit}
        onImageChange={handleImageChange}
        previewImage={previewImage}
        isEdit={true}
      />
    </div>
  );
}
