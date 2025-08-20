import { getCategories } from '@/actions/categories';
import { getProducts } from '@/actions/products';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductsClient from './products-client';
import ProductsLoading from './products-loading';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  const filters = {
    search: params.search || '',
    category: params.category || '',
    isActive: params.status === 'active' ? true : 
              params.status === 'inactive' ? false : undefined,
    sortBy: (params.sort?.split('-')[0] as any) || 'created_at',
    sortOrder: (params.sort?.split('-')[1] as any) || 'desc',
    page: parseInt(params.page || '1'),
    limit: 20
  };

  // Fetch initial data on server
  const [productsData, categories] = await Promise.all([
    getProducts(filters),
    getCategories()
  ]);

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
        <ProductsClient 
          initialData={productsData}
          categories={categories}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  );
}