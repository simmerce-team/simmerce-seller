"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteProduct, useProduct } from "@/hooks/useProductQueries";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Components
import { use } from "react";
import { ProductHeader } from "./components/product-header";
import { ProductImages } from "./components/product-images";
import { ProductInfo } from "./components/product-info";
import { ProductSidebar } from "./components/product-sidebar";

type Params = Promise<{ id: string }>;

export default function ProductDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const productId = use(params).id;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Use React Query to fetch the product
  const { 
    data: product, 
    isLoading, 
    error: fetchError 
  } = useProduct(productId, isMounted);
  
  // Use React Query mutation for deletion
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  
  const handleDelete = () => {
    if (!product) return;
    
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(product.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading product...</span>
      </div>
    );
  }

  if (fetchError || !product) {
    const errorMessage = fetchError?.message || 'Product not found';
    
    return (
      <div className="text-center py-12 px-6">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {errorMessage}
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="gap-2"
          disabled={isDeleting}
        >
          <ArrowLeft className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Back to Products'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      <ProductHeader 
        product={{
          id: product.id,
          status: product.is_active ? 'active' : 'draft',
          updated_at: product.updated_at,
          view_count: product.view_count || 0
        }}
      />

      <div className="grid gap-6 md:grid-cols-4">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Product Images and Basic Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <ProductImages 
                    images={product.images || []} 
                    name={product.name} 
                  />
                </div>
                <div className="space-y-6">
                  <ProductInfo
                    name={product.name}
                    price={Number(product.price)}
                    stockQuantity={product.stock_quantity || 0}
                    category={product.category?.name}
                    moq={product.moq}
                    viewCount={product.view_count || 0}
                    enquiryCount={product.enquiry_count || 0}
                    conversionRate={product.view_count && product.enquiry_count 
                      ? (product.enquiry_count / product.view_count) * 100 
                      : 0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
               <p className="prose max-w-none text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <ProductSidebar 
            status={product.is_active ? 'active' : 'draft'}
            createdAt={product.created_at}
            updatedAt={product.updated_at}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}