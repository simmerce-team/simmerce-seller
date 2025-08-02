'use client';

import { getSellerProducts, toggleProductStatus, type Product } from '@/actions/products';
import { deleteProduct, getProductById, updateProduct } from '@/actions/show-product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const PRODUCTS_QUERY_KEY = 'seller-products';

export function useProducts() {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await getSellerProducts();
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data) {
        throw new Error('No products found');
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { success, error } = await toggleProductStatus(productId, isActive);
      
      if (!success) {
        throw new Error(error || 'Failed to update product status');
      }
      
      return { success };
    },
    onMutate: async ({ productId, isActive }) => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      
      const previousProducts = queryClient.getQueryData<Product[]>([PRODUCTS_QUERY_KEY]);
      
      if (previousProducts) {
        queryClient.setQueryData<Product[]>([PRODUCTS_QUERY_KEY], (old) => 
          old?.map(product => 
            product.id === productId 
              ? { ...product, is_active: isActive } 
              : product
          )
        );
      }
      
      return { previousProducts };
    },
    onError: (error, variables, context) => {
      // Revert on error
      if (context?.previousProducts) {
        queryClient.setQueryData([PRODUCTS_QUERY_KEY], context.previousProducts);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });
}

// Helper function to filter products
const filterProducts = (products: Product[], searchTerm: string, statusFilter: string) => {
  if (!products) return [];
  
  return products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesStatus;
  });
};

export function useFilteredProducts(searchTerm: string, statusFilter: string) {
  const { data: products = [], isLoading, error } = useProducts();
  
  const filteredProducts = filterProducts(products, searchTerm, statusFilter);
  
  return {
    products: filteredProducts,
    isLoading,
    error: error ? (error as Error).message : null,
    totalCount: products.length,
    filteredCount: filteredProducts.length
  };
}

export const useProduct = (productId: string, isClient: boolean = false) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!isClient) return null;
      
      const { data, error } = await getProductById(productId);
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data) {
        throw new Error('Product not found');
      }
      
      return data;
    },
    enabled: !!productId && isClient,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedProduct: Partial<Product> & { id: string }) => {
      const { data, error } = await updateProduct(updatedProduct.id, updatedProduct);
      
      if (error) {
        throw new Error(error);
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        // Update the product in the products list
        queryClient.setQueryData(['product', data.id], data);
        queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
        toast.success('Product updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const { success, error } = await deleteProduct(productId);
      
      if (!success) {
        throw new Error(error || 'Failed to delete product');
      }
      
      return { success };
    },
    onSuccess: () => {
      // Invalidate both the products list and any individual product queries
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      toast.success('Product deleted successfully');
      router.push('/products');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};
