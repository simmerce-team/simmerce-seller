"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteProduct, getProductById } from "../../../../../actions/show-product";
import { Product } from "./types";

// Components
import { ProductDescription } from "./components/product-description";
import { ProductHeader } from "./components/product-header";
import { ProductImages } from "./components/product-images";
import { ProductInfo } from "./components/product-info";
import { ProductSidebar } from "./components/product-sidebar";

type Params = Promise<{ id: string }>

export default function ProductDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id: productId } = use(params);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await getProductById(productId);
        
        if (error) {
          console.error('Error fetching product:', error);
          setError(error);
          toast.error(error);
          return;
        }
        
        setProduct(data);
      } catch (err) {
        console.error('Caught error in fetchProduct:', err);
        const message = err instanceof Error ? err.message : 'Failed to fetch product';
        setError(message);
        toast.error(message);
      } finally {
        console.log('Finished loading, setting loading to false');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct().catch(err => {
        console.error('Unhandled error in fetchProduct:', err);
      });
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!product) return;
    
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const { success, error } = await deleteProduct(product.id);
      
      if (success) {
        toast.success("Product deleted successfully");
        router.push("/products");
      } else {
        toast.error(error || "Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12 px-6">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      <ProductHeader 
        product={{
          id: product.id,
          name: product.name,
          status: product.is_active ? 'active' : 'draft',
          sku: product.sku || 'N/A',
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
                    compareAtPrice={product.compare_at_price ? Number(product.compare_at_price) : undefined}
                    rating={4.5} // This would come from reviews table
                    reviewCount={12} // This would come from reviews table
                    stockQuantity={product.stock_quantity || 0}
                    category={product.category?.name}
                    businessName={product.business?.name}
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
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <ProductDescription description={product.description || ''} />
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
          />
        </div>
      </div>
    </div>
  );
}