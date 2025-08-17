"use client";

import { addProduct, checkDuplicateProduct } from '@/actions/add-product';
import { uploadProductFile, uploadProductImages } from '@/actions/file-upload';
import { Category, getCategories } from '@/actions/get-categories';
import { deleteProduct } from '@/actions/show-product';
import { ProductForm } from '@/components/product/product-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

// Constants for file validation
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 3;

export default function AddProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

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

  const validateFiles = (files: File[]): { valid: boolean; message?: string } => {
    // Check number of images
    if (files.length > MAX_IMAGES) {
      return { valid: false, message: `You can upload a maximum of ${MAX_IMAGES} images` };
    }

    // Check each file size and type
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_IMAGE_SIZE) {
          return { valid: false, message: `Image ${file.name} exceeds the maximum size of 5MB` };
        }
      } else if (file.type === 'application/pdf') {
        if (file.size > MAX_PDF_SIZE) {
          return { valid: false, message: `PDF ${file.name} exceeds the maximum size of 10MB` };
        }
      } else {
        return { valid: false, message: `Unsupported file type: ${file.name}. Only images and PDFs are allowed.` };
      }
    }

    return { valid: true };
  };

  const handleFilesChange = (files: File[]) => {
    const validation = validateFiles(files);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    
    // Revoke old URLs to prevent memory leaks
    previewImages.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs for images only
    const newPreviewUrls = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => URL.createObjectURL(file));
      
    setPreviewImages(newPreviewUrls);
    setSelectedFiles(files);
  };

  const handlePdfChange = (file: File | null) => {
    if (file) {
      if (file.size > MAX_PDF_SIZE) {
        toast.error(`PDF exceeds the maximum size of 10MB`);
        return;
      }
      
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      
      // Revoke old URL if exists
      if (previewPdf) {
        URL.revokeObjectURL(previewPdf);
      }
      
      const url = URL.createObjectURL(file);
      setPreviewPdf(url);
    } else {
      if (previewPdf) {
        URL.revokeObjectURL(previewPdf);
      }
      setPreviewPdf(null);
    }
    
    setSelectedPdf(file);
  };

  const handleSubmit = async (formData: any) => {
    // Validate required fields
    if (!formData.name?.trim() || !formData.price || !formData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setIsLoading(true);
    
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
      const isDuplicate = await checkDuplicateProduct(
        formData.name.trim(), 
        userBusiness.business_id
      );
      
      if (isDuplicate) {
        toast.error('A product with this name already exists in your business');
        setIsLoading(false);
        return;
      }

      // First create the product
      const { data: product, error: productError } = await addProduct({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price) || 0,
        unit: formData.unit,
        moq: parseInt(formData.moq) || 1,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id || null,
        is_active: formData.is_active ?? true,
        youtube_url: formData.youtube_url || null,
      });

      if (productError || !product) {
        throw new Error(productError || 'Failed to create product');
      }

      // Process file uploads in sequence to handle errors properly
      try {
        // Upload images
        if (selectedFiles.length > 0) {
          const { error: imageError } = await uploadProductImages(
            product.id,
            selectedFiles
          );
          
          if (imageError) {
            throw new Error(`Image upload failed: ${imageError}`);
          }
        }

        // Upload PDF if provided
        if (selectedPdf) {
          const { error: pdfError } = await uploadProductFile(
            product.id,
            selectedPdf,
            'pdf'
          );
          
          if (pdfError) {
            throw new Error(`PDF upload failed: ${pdfError}`);
          }
        }

        toast.success('Product added successfully!');
        router.push(`/products/${product.id}`);
      } catch (uploadError) {
        // If file upload fails, delete the product to maintain consistency
        console.error('File upload error:', uploadError);
        await deleteProduct(product.id).catch(console.error);
        throw new Error('Failed to upload files. Please try again.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="container mx-auto py-6">
      <CardHeader>
        <CardTitle>
        <Button
          variant="link"
          size={"icon"}
          onClick={() => router.push('/products')}
        >
          <ArrowLeft/>
        </Button>
          Add New Product</CardTitle>
        <CardDescription>Add a new product to your inventory</CardDescription>
      </CardHeader>
      <CardContent>
      <ProductForm
        initialData={{
          name: '',
          description: '',
          price: 0,
          unit: 'pcs',
          moq: 1,
          stock_quantity: 0,
          category_id: '',
          is_active: true,
          youtube_url: '',
          files: [],
          existingFiles: [],
          pdfFile: null,
          existingPdf: null,
        }}
        categories={categories}
        isPending={isPending}
        onSubmit={handleSubmit}
        onFilesChange={handleFilesChange}
        onPdfChange={handlePdfChange}
        previewImages={previewImages}
        previewPdf={previewPdf}
        isEdit={false}
      />
      </CardContent>
    </Card>  
  );
}