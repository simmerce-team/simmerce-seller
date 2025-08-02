'use client';

import { type Product } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFilteredProducts, useToggleProductStatus } from "@/hooks/useProductQueries";
import { Images } from "@/utils/constant";
import { formatPrice, StockStatusBadge } from "@/utils/helpers";
import { AlertCircle, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";



export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  type StatusFilter = 'all' | 'active' | 'draft' | 'out_of_stock' | 'low_stock';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
  };
  
  // Use React Query hooks
  const { 
    products: filteredProducts = [], 
    isLoading, 
    error,
    totalCount = 0,
    filteredCount = 0
  } = useFilteredProducts(searchTerm, statusFilter);
  
  const { mutate: toggleStatus, isPending: isToggling, variables } = useToggleProductStatus();
  
  // Handle product status toggle
  const handleToggleStatus = (product: Product) => {
    toggleStatus({ 
      productId: product.id, 
      isActive: !product.is_active 
    });
  };
  
  // Safely format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
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
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product listings and inventory</p>
        </div>
        <Link href="/products/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl">All Products</CardTitle>
              <CardDescription className="text-sm sm:text-base">View and manage your product listings</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {product.primary_image && (
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={product.primary_image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Link href={`/products/${product.id}`} className="font-medium hover:text-primary line-clamp-2">
                          {product.name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`} className="w-full">
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`} className="w-full">
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleToggleStatus(product)}
                            disabled={isToggling && variables?.productId === product.id}
                          >
                            {isToggling && variables?.productId === product.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <span>{product.is_active ? 'Deactivate' : 'Activate'}</span>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                            {formatPrice(product.compare_at_price, product.unit)}
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
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Views</div>
                      <div>
                        {product.view_count}
                        {product.enquiry_count > 0 && product.view_count > 0 && (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({(product.enquiry_count / product.view_count * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 text-xs text-muted-foreground">
                    Updated: {formatDate(product.updated_at)}
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
                <TableHead className="px-4 text-right">Views</TableHead>
                <TableHead className="px-4">Last Updated</TableHead>
                <TableHead className="w-[50px] px-4"></TableHead>
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
                        
                        <Link href={`/products/${product.id}`} className="hover:text-primary line-clamp-2 font-medium">
                          {product.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap">{formatPrice(product.price, product.unit)}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.compare_at_price, product.unit)}
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
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{product.view_count}</span>
                        {product.enquiry_count > 0 && product.view_count > 0 && (
                          <span className="text-muted-foreground text-xs">
                            ({Math.round((product.enquiry_count / product.view_count) * 100)}%)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(product.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`} className="w-full">
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`} className="w-full">
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleToggleStatus(product)}
                            disabled={isToggling && variables?.productId === product.id}
                          >
                            {isToggling && variables?.productId === product.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <span>{product.is_active ? 'Deactivate' : 'Activate'}</span>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{filteredProducts.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-medium">{filteredProducts.length}</span> of{' '}
            <span className="font-medium">{totalCount}</span> products
            {statusFilter !== 'all' && ` (${filteredCount} match filter)`}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}