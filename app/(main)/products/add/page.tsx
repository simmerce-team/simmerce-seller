"use client";

import { addProduct, checkDuplicateProduct } from '@/actions/add-product';
import { uploadProductImage } from '@/actions/file-upload';
import { getCategories } from '@/actions/get-categories';
import { ProductForm } from '@/components/product/product-form';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

export default function AddProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);


  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    
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
    // Validate required fields
    if (!formData.name || !formData.price || !formData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }
    
    if (!selectedImage) {
      toast.error('Please upload a product image');
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

        // Check for duplicate product name within the same business
        const isDuplicate = await checkDuplicateProduct(formData.name.trim(), userBusiness.business_id);
        
        if (isDuplicate) {
          toast.error('A product with this name already exists in your business');
          return;
        }

        // First, add the product
        const { data: product, error } = await addProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          unit: formData.unit,
          moq: parseInt(formData.moq) || 1,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
        });

        if (error) {
          throw new Error(error);
        }

        // If there's an image, upload it
        if (selectedImage && product) {
          const { error: uploadError } = await uploadProductImage(product.id, selectedImage);
          
          if (uploadError) {
            // Even if image upload fails, we still want to show success for the product
            console.error('Error uploading image:', uploadError);
            toast.success('Product added successfully, but there was an error uploading the image');
          }
        }

        toast.success('Product added successfully');
        router.push('/products');
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to add product');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="md:text-2xl font-bold">Add New Product</h1>
        <p className="text-sm text-muted-foreground">Add a new product to your inventory</p>
      </div>
      
      <ProductForm
        initialData={{
          name: '',
          description: '',
          price: '',
          unit: 'pcs',
          moq: '1',
          stock_quantity: '0',
          category_id: '',
          is_active: true,
        }}
        categories={categories}
        isPending={isPending}
        onSubmit={handleSubmit}
        onImageChange={handleImageChange}
        previewImage={previewImage}
        isEdit={false}
      />
    </div>
  );
}