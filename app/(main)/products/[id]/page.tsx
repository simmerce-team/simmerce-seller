import { getProduct, ProductDetail } from "@/actions/products";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import DeleteProduct from "./_components/delete_product";
import ProductDetails from "./_components/product-detail";
import ProductHeader from "./_components/product-header";
import ProductMedia from "./_components/product-media";

// Loading component
function ProductLoading() {
  return <Loading />;
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
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" asChild>
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <DeleteProduct productId={(await params).id} />
      </div>
      <Suspense fallback={<ProductLoading />}>
        <ProductContent id={(await params).id} />
      </Suspense>
    </div>
  );
}
