"use client";

import { checkDuplicateProduct } from "@/actions/add-product";
import { deleteProductFile, uploadProductFile, uploadProductImages } from "@/actions/file-upload";
import { Category, getCategories } from "@/actions/get-categories";
import { updateProduct } from "@/actions/show-product";
import { ProductForm } from "@/components/product/product-form";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProduct } from "@/hooks/useProductQueries";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useState } from "react";
import { toast } from "sonner";

type Params = Promise<{ id: string }>;

export default function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<Array<{
    id: string;
    url: string;
    file_type: string;
    is_primary: boolean;
  }>>([]);

  const paramsData = use(params);

  // Fetch product data
  const { data: product, isLoading: isProductLoading } = useProduct(
    paramsData.id,
    true
  );
  
  // Set initial data when product is loaded
  useEffect(() => {
    if (product) {
      if (product.files) {
        const images = product.files.filter((f: any) => f.file_type === 'image');
        const pdf = product.files.find((f: any) => f.file_type === 'pdf');
        
        setExistingFiles(product.files);
        setPreviewImages(images.map((img: any) => img.url));
        
        if (pdf) {
          setPreviewPdf(pdf.url);
        }
      }
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

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handlePdfChange = (file: File | null) => {
    setSelectedPdf(file);
  };

  const handleSubmit = async (formData: any) => {
    setIsPending(true);
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.unit) {
      toast.error("Please fill in all required fields");
      setIsPending(false);
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
          setIsPending(false);
          return;
        }

        // Update the product
        const { error: updateError } = await updateProduct(
          paramsData.id,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: formData.price,
            unit: formData.unit,
            moq: formData.moq,
            stock_quantity: formData.stock_quantity,
            category_id: formData.category_id,
            is_active: formData.is_active,
            youtube_url: formData.youtube_url || null,
          }
        );

        if (updateError) {
          throw new Error(updateError);
        }

        // Process file uploads and deletions
        try {
          // Delete files that were marked for deletion
          if (deletedFileIds.length > 0) {
            await Promise.all(
              deletedFileIds.map(fileId => 
                deleteProductFile(fileId).catch(console.error)
              )
            );
          }

          // Upload new images if any
          if (selectedFiles.length > 0) {
            await uploadProductImages(
              paramsData.id,
              selectedFiles,
              { isUpdate: true }
            );
          }

          // Upload new PDF if provided
          if (selectedPdf) {
            await uploadProductFile(
              paramsData.id,
              selectedPdf,
              'pdf',
              { isUpdate: true }
            );
          }
        } catch (fileError) {
          console.error('File upload error:', fileError);
          toast.error('Product updated, but there was an issue with file uploads');
        }

        setIsPending(false);
        toast.success('Product updated successfully!');
        router.push(`/products/${paramsData.id}`);
      } catch (error) {
        console.error('Error updating product:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update product');
        setIsPending(false);
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
          Edit Product</CardTitle>
        <CardDescription>Update your product details below</CardDescription>
      </CardHeader>
      
      <CardContent>
      <ProductForm
        initialData={{
          name: product.name,
          description: product.description || '',
          price: product.price,
          unit: product.unit,
          moq: product.moq,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id,
          is_active: product.is_active,
          youtube_url: product.youtube_url || '',
          files: [],
          existingFiles: existingFiles,
          pdfFile: null,
          existingPdf: previewPdf,
        }}
        categories={categories}
        isPending={isPending}
        onSubmit={handleSubmit}
        onFilesChange={handleFilesChange}
        onPdfChange={handlePdfChange}
        previewImages={previewImages}
        previewPdf={previewPdf}
        isEdit={true}
      />
      </CardContent>
    </Card>
  );
}
