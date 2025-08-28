'use client';

import type { ProductListItem } from '@/actions/products';
import {
  deleteProduct,
  getProduct,
  getProducts
} from '@/actions/products';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query keys
export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
};

/**
 * Hook to fetch products with React Query caching (no filters)
 */
export function useProducts(options?: {
  enabled?: boolean;
  initialData?: ProductListItem[];
}) {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.lists(),
    queryFn: () => getProducts(),
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
 * Hook to delete a product with cache updates
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),

    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });

      // Snapshot previous lists data (may be multiple queries)
      const previousProducts = queryClient.getQueriesData({ queryKey: PRODUCTS_QUERY_KEYS.lists() });

      // Optimistically remove from any cached lists (now arrays)
      queryClient.setQueriesData(
        { queryKey: PRODUCTS_QUERY_KEYS.lists() },
        (old: unknown) => {
          const list = old as import("@/actions/products").ProductListItem[] | undefined;
          if (!Array.isArray(list)) return old;
          return list.filter((p) => p.id !== productId);
        }
      );

      // Also update individual product cache if it exists
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(productId),
        null
      );

      return { previousProducts };
    },

    onError: (_err, _productId, context) => {
      // Revert the optimistic update
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete product');
    },

    onSuccess: (data) => {
      if (data.success) {
        toast.success('Product deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });
    },
  });
}