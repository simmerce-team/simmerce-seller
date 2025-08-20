"use client";

import { useDebouncedCallback } from "@/hooks/use-debounce";
import {
    BarChart3,
    Eye,
    IndianRupee,
    Loader2,
    Package,
    Plus,
    Search,
    ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import type { Category } from "@/actions/categories";
import type {
    ProductListItem,
    ProductsFilters,
    ProductsResponse,
} from "@/actions/products";
import { useProducts, useUpdateProductStatus } from "@/hooks/use-products";
import { formatPrice } from "@/utils/format";

interface ProductsClientProps {
  initialData: ProductsResponse;
  categories: Category[];
  initialFilters: ProductsFilters;
}

export default function ProductsClient({
  initialData,
  categories,
  initialFilters,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State for filters and pagination
  const [filters, setFilters] = useState<ProductsFilters>(initialFilters);
  const [searchValue, setSearchValue] = useState(initialFilters.search);
  const [isSearching, setIsSearching] = useState(false);

  // Queries - only fetch if filters changed from initial
  const shouldFetch = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts(filters, {
    enabled: shouldFetch,
    initialData: shouldFetch ? undefined : initialData,
  });

  // Mutations
  const updateStatusMutation = useUpdateProductStatus();

  // Use initial data if not fetching new data
  const currentData = shouldFetch ? productsData : initialData;
  const products = useMemo(
    () => currentData?.products || [],
    [currentData?.products]
  );

  // Debounced search to avoid too many requests
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setIsSearching(false);
    updateURL({ search: value, page: 1 });
  }, 500);

  // Update URL with new filters
  const updateURL = useCallback(
    (newFilters: Partial<ProductsFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      startTransition(() => {
        const params = new URLSearchParams(searchParams);

        // Update search params
        if (updatedFilters.search) {
          params.set("search", updatedFilters.search);
        } else {
          params.delete("search");
        }

        if (updatedFilters.category) {
          params.set("category", updatedFilters.category);
        } else {
          params.delete("category");
        }

        if (updatedFilters.isActive !== undefined) {
          params.set("status", updatedFilters.isActive ? "active" : "inactive");
        } else {
          params.delete("status");
        }

        if (updatedFilters.sortBy && updatedFilters.sortOrder) {
          params.set(
            "sort",
            `${updatedFilters.sortBy}-${updatedFilters.sortOrder}`
          );
        } else {
          params.delete("sort");
        }

        if (updatedFilters.page && updatedFilters.page > 1) {
          params.set("page", updatedFilters.page.toString());
        } else {
          params.delete("page");
        }

        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [filters, router, searchParams]
  );

  // Handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setIsSearching(true);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateURL({ category: value === "all" ? "" : value, page: 1 });
    },
    [updateURL]
  );

  const handleStatusFilter = useCallback(
    (value: string) => {
      let isActive: boolean | undefined;
      if (value === "active") isActive = true;
      else if (value === "inactive") isActive = false;
      else isActive = undefined;

      updateURL({ isActive, page: 1 });
    },
    [updateURL]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const [sortBy, sortOrder] = value.split("-") as [
        ProductsFilters["sortBy"],
        ProductsFilters["sortOrder"]
      ];
      updateURL({ sortBy, sortOrder, page: 1 });
    },
    [updateURL]
  );

  const handleStatusToggle = useCallback(
    (productId: string, currentStatus: boolean) => {
      updateStatusMutation.mutate({ productId, isActive: !currentStatus });
    },
    [updateStatusMutation]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateURL({ page: newPage });
    },
    [updateURL]
  );

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Skeleton className="w-full h-48 sm:w-32 sm:h-32 lg:w-40 lg:h-40" />
          <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3">
            <Skeleton className="h-5 sm:h-6 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            </div>
            <div className="flex justify-between items-center pt-1 sm:pt-2">
              <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
              <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

                  {/* Status Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() =>
                        handleStatusToggle(product.id, product.is_active)
                      }
                      disabled={updateStatusMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
    </Link>
      </Card>
  );

  const showLoading = isLoading || isPending;
  const showSearchLoading = isSearching && !showLoading;

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent className="md:p-3">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {showSearchLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Filters Row */}
            <div className="hidden md:flex gap-2 sm:gap-4">
              {/* Category Filter */}
              <Select
                value={filters.category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={
                  filters.isActive === true
                    ? "active"
                    : filters.isActive === false
                    ? "inactive"
                    : "all"
                }
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest</SelectItem>
                  <SelectItem value="created_at-asc">Oldest</SelectItem>
                  <SelectItem value="name-asc">A-Z</SelectItem>
                  <SelectItem value="name-desc">Z-A</SelectItem>
                  <SelectItem value="price-asc">Price ↑</SelectItem>
                  <SelectItem value="price-desc">Price ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-3 sm:space-y-4">
        {showLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : error ? (
          // Error state
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-muted-foreground">
                Failed to load products. Please try again.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {filters.search ||
                filters.category ||
                filters.isActive !== undefined
                  ? "Try adjusting your filters or search terms."
                  : "Get started by adding your first product."}
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
          // Products list
          <>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Pagination */}
            {currentData && currentData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1 || showLoading}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground order-first sm:order-none">
                  Page {filters.page} of {currentData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={
                    filters.page === currentData.totalPages || showLoading
                  }
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
