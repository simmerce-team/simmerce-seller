"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

// Components
import { getProductById, Product } from "@/actions/show-product";
import { ProductHeader } from "./components/product-header";
import { ImageArea } from "./components/product-images";
import { ProductInfo } from "./components/product-info";

type Params = Promise<{ id: string }>;

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
          console.error("Error fetching product:", error);
          setError(error);
          toast.error(error);
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error("Caught error in fetchProduct:", err);
        const message =
          err instanceof Error ? err.message : "Failed to fetch product";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct().catch((err) => {
        console.error("Unhandled error in fetchProduct:", err);
      });
    } else {
      setError("No product ID provided");
      setLoading(false);
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/products")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductHeader
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          status: product.is_active ? "active" : "draft",
        }}
      />

      {/* Product Images and Basic Info */}
      <div className="grid gap-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <ImageArea product={product} />
        </div>
        <div className="md:col-span-4">
          <ProductInfo
            name={product.name}
            price={Number(product.price)}
            stockQuantity={product.stock_quantity || 0}
            category={product.category?.name}
            moq={product.moq}
            unit={product.unit}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-slate-700">
            {product.description ? (
              typeof product.description === "string" ? (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="space-y-2">
                  {Object.entries(product.description).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="text-slate-500 italic">
                No description available for this product.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
