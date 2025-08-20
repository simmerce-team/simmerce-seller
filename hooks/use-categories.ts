'use client';

import { getCategories } from '@/actions/categories';
import { useQuery } from '@tanstack/react-query';

// Query keys for categories
export const CATEGORIES_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORIES_QUERY_KEYS.all, 'list'] as const,
  list: () => [...CATEGORIES_QUERY_KEYS.lists()] as const,
};

/**
 * Hook to fetch categories with React Query caching
 */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.list(),
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
