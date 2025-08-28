"use client";

import {
  BarChart3,
  Eye,
  IndianRupee,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ProductListItem } from "@/actions/products";
import { formatPrice } from "@/utils/format";

type ProductsClientProps = { products: ProductListItem[] };

export default function ProductsClient({ products }: ProductsClientProps) {
  // Mobile-optimized Product card component
  const ProductCard = ({ product }: { product: ProductListItem }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow p-0">
      <Link href={`/products/${product.id}`} className="cursor-pointer">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Product Image */}
            <div className="relative w-full h-48 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex-shrink-0 bg-gray-100">
              {product.primary_image_url ? (
                <Image
                  src={product.primary_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 128px, 160px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {!product.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 p-3 sm:p-4 min-w-0">
              <div className="space-y-2 sm:space-y-3">
                {/* Product Name & Category */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 sm:truncate">
                    {product.name}
                  </h3>
                  {product.category_name && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {product.category_name}
                    </p>
                  )}
                </div>

                {/* Price & Key Details */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs sm:text-sm">/{product.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">MOQ:</span>
                    <span className="sm:hidden">Min:</span>
                    {product.moq}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    Stock: {product.stock_quantity}
                  </div>
                </div>

                {/* Stats & Status */}
                <div className="flex items-center justify-between pt-1 sm:pt-2">
                  <div className="flex gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {product.view_count}
                      <span className="hidden sm:inline">views</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {product.enquiry_count}
                      <span className="hidden sm:inline">enquiries</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <>
      {/* Products List */}
      <div className="space-y-3 sm:space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Get started by adding your first product.
              </p>
              <Button asChild>
                <Link href="/products/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
