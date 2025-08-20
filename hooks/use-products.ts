'use client';

import {
    deleteProduct,
    getProduct,
    getProducts,
    updateProductStatus,
    type ProductDetail,
    type ProductsFilters,
    type ProductsResponse
} from '@/actions/products';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: ProductsFilters) => [...PRODUCTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook to fetch products with React Query caching
 */
export function useProducts(filters: ProductsFilters = {}, options?: {
  enabled?: boolean;
  initialData?: ProductsResponse;
}) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  });
}

/**
 * Hook to fetch a single product
 */
export function useProduct(productId: string) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
    queryFn: () => getProduct(productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!productId,
  });
}

/**
 * Hook to update product status with optimistic updates
 */
export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      updateProductStatus(productId, isActive),
    
    onMutate: async ({ productId, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueriesData({ queryKey: PRODUCTS_QUERY_KEYS.lists() });

      // Optimistically update to the new value
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: PRODUCTS_QUERY_KEYS.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.map(product =>
              product.id === productId
                ? { ...product, is_active: isActive, updated_at: new Date().toISOString() }
                : product
            ),
          };
        }
      );

      // Also update individual product cache if it exists
      queryClient.setQueryData<ProductDetail | null>(
        PRODUCTS_QUERY_KEYS.detail(productId),
        (old) => {
          if (!old) return old;
          return { ...old, is_active: isActive, updated_at: new Date().toISOString() };
        }
      );

      return { previousProducts };
    },

    onError: (err, variables, context) => {
      // Revert the optimistic update
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Failed to update product status');
      console.error('Error updating product status:', err);
    },

    onSuccess: (data, { isActive }) => {
      if (data.success) {
        toast.success(`Product ${isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(data.error || 'Failed to update product status');
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to delete a product with cache updates
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueriesData({ queryKey: PRODUCTS_QUERY_KEYS.lists() });

      // Optimistically remove the product
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: PRODUCTS_QUERY_KEYS.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.filter(product => product.id !== productId),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      // Remove individual product cache
      queryClient.removeQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });

      return { previousProducts };
    },

    onError: (err, productId, context) => {
      // Revert the optimistic update
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Failed to delete product');
      console.error('Error deleting product:', err);
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success('Product deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to prefetch products for better UX
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  const prefetchProducts = (filters: ProductsFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: PRODUCTS_QUERY_KEYS.list(filters),
      queryFn: () => getProducts(filters),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProduct = (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
      queryFn: () => getProduct(productId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchProducts, prefetchProduct };
}

/**
 * Hook to invalidate products cache (useful after creating/updating products)
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });
  };

  const invalidateProduct = (productId: string) => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });
  };

  return { invalidateProducts, invalidateProduct };
}
