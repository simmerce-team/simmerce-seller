import { getProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ProductsClient from "./products-client";
import ProductsLoading from "./products-loading";

export default async function ProductsPage() {
  // Fetch initial data on server
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        {/* Add Product Button */}
        <Button asChild>
          <Link href="/products/add">
            <Plus className="md:mr-2 h-4 w-4" />
            <span className="hidden md:block">Add Product</span>
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <ProductsClient products={products} />
      </Suspense>
    </div>
  );
}
