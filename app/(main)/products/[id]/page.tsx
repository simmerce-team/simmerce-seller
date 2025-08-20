import { getProduct, ProductDetail } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductDetails from "./_components/product-detail";
import ProductHeader from "./_components/product-header";
import ProductMedia from "./_components/product-media";

// Loading component
function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

// Main component
async function ProductContent({ id }: { id: string }) {
  let product: ProductDetail | null = null;

  try {
    product = await getProduct(id);
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/products" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid md:grid-cols-5 gap-4 items-start">
        <div className="md:col-span-2">
          <ProductMedia product={product} />
        </div>

        <div className="md:col-span-3">
          <div className="space-y-4">
            <ProductHeader product={product} />
            <ProductDetails product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductContent id={(await params).id} />
    </Suspense>
  );
}
