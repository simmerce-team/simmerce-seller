"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useFilteredProducts
} from "@/hooks/useProductQueries";
import { Images } from "@/utils/constant";
import { formatPrice, StockStatusBadge } from "@/utils/helpers";
import { AlertCircle, Edit, Eye, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {

  // Use React Query hooks
  const {
    products: filteredProducts = [],
    isLoading,
    error,
    totalCount = 0,
  } = useFilteredProducts("", "all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-lg font-medium">Error loading products</p>
          </div>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0 block md:flex md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="space-y-2">
            <CardTitle>All Products ({totalCount})</CardTitle>
            <CardDescription>
              View and manage your product listings
            </CardDescription>
          </div>
          <CardAction className="w-full md:w-auto">
            <Link href="/products/add" className="w-full md:w-auto">
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={product.primary_image || Images.placeholder}
                          alt={product.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                        </div>
                      
                      <div>
                        <Link
                          href={`/products/${product.id}`}
                          className="font-medium hover:text-primary line-clamp-2"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Price</div>
                      <div>
                        <div>{formatPrice(product.price, product.unit)}</div>
                        {product.compare_at_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(
                              product.compare_at_price,
                              product.unit
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Stock</div>
                      <div>
                        <div>{product.stock_quantity.toLocaleString()}</div>
                        {product.moq > 1 && (
                          <div className="text-xs text-muted-foreground">
                            MOQ: {product.moq}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Status</div>
                      <StockStatusBadge
                        stock={product.stock_quantity}
                        isActive={product.is_active}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No products found
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] px-4">Product</TableHead>
                  <TableHead className="px-4 text-right">Price</TableHead>
                  <TableHead className="px-4 text-right">Stock</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group">
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={product.primary_image || Images.placeholder}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <Link
                            href={`/products/${product.id}`}
                            className="hover:text-primary line-clamp-2 font-medium"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">
                            {formatPrice(product.price, product.unit)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(
                                product.compare_at_price,
                                product.unit
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex flex-col">
                          <span>{product.stock_quantity.toLocaleString()}</span>
                          {product.moq > 1 && (
                            <span className="text-xs text-muted-foreground">
                              MOQ: {product.moq}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StockStatusBadge
                          stock={product.stock_quantity}
                          isActive={product.is_active}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                          >
                            <Button variant="default" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/products/${product.id}/edit`}
                          >
                            <Button variant="secondary" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
