'use client';

import { getSellerProducts, toggleProductStatus, type Product } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Helper function to format price
const formatPrice = (price: number | null, unit: string = '') => {
  if (price === null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price) + (unit ? `/${unit}` : '');
};

// Helper function to get stock status
const getStockStatus = (stock: number, isActive: boolean) => {
  if (!isActive) return 'draft';
  if (stock <= 0) return 'out_of_stock';
  if (stock < 10) return 'low_stock';
  return 'active';
};

// Component for stock status badge
const StockStatusBadge = ({ stock, isActive }: { stock: number, isActive: boolean }) => {
  const status = getStockStatus(stock, isActive);
  const statusText = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <Badge
      variant={
        status === 'active' ? 'default' :
        status === 'draft' ? 'outline' :
        status === 'out_of_stock' ? 'destructive' :
        'secondary'
      }
      className="capitalize"
    >
      {statusText}
    </Badge>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await getSellerProducts();
        
        if (error) throw new Error(error);
        if (data) setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product status toggle
  const handleToggleStatus = async (product: Product) => {
    if (isToggling) return;
    
    setIsToggling(product.id);
    try {
      const { success, error } = await toggleProductStatus(
        product.id, 
        !product.is_active
      );
      
      if (!success) throw new Error(error || 'Failed to update product status');
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, is_active: !p.is_active } 
            : p
        )
      );
      
      toast.success(`Product ${product.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      console.error('Error toggling product status:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update product status');
    } finally {
      setIsToggling(null);
    }
  };

  // Filter products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active && product.stock_quantity > 10) ||
                         (statusFilter === 'draft' && !product.is_active) ||
                         (statusFilter === 'out_of_stock' && product.stock_quantity <= 0) ||
                         (statusFilter === 'low_stock' && product.stock_quantity > 0 && product.stock_quantity <= 10);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <button
                type="button"
                className="rounded-md bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product listings and inventory</p>
        </div>
        <Link href="/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle>All Products</CardTitle>
              <CardDescription>View and manage your product listings</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.primary_image && (
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={product.primary_image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <Link href={`/products/${product.id}`} className="hover:text-primary line-clamp-2">
                          {product.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.sku || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatPrice(product.price, product.unit)}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.compare_at_price, product.unit)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.stock_quantity.toLocaleString()}
                      {product.moq > 1 && (
                        <div className="text-xs text-muted-foreground">
                          MOQ: {product.moq}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StockStatusBadge 
                        stock={product.stock_quantity} 
                        isActive={product.is_active} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{product.view_count}</span>
                        {product.enquiry_count > 0 && product.view_count > 0 && (
                          <span className="text-muted-foreground text-xs">
                            ({Math.round((product.enquiry_count / product.view_count) * 100)}%)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
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
                            disabled={isToggling === product.id}
                          >
                            {isToggling === product.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <span>{product.is_active ? 'Deactivate' : 'Activate'}</span>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{filteredProducts.length}</span> of{' '}
            <span className="font-medium">{filteredProducts.length}</span> products
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