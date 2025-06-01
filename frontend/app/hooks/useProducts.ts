import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '@/utils/api';
import { Product } from '@/types';

// Query keys for caching
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
  bySlug: (slug: string) => [...productQueryKeys.all, 'slug', slug] as const,
};

// Get all products with filters
export const useProducts = (filters: {
  category?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
} = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Get featured products
export const useFeaturedProducts = (limit = 6) => {
  return useProducts({ featured: true, limit });
};

// Get single product by ID
export const useProduct = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productAPI.getById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual products
    retry: 2,
  });
};

// Get product by slug
export const useProductBySlug = (slug: string, enabled = true) => {
  return useQuery({
    queryKey: productQueryKeys.bySlug(slug),
    queryFn: () => productAPI.getBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Create product mutation (admin only)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productAPI.create,
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      
      // Add the new product to cache
      queryClient.setQueryData(
        productQueryKeys.detail(newProduct._id),
        newProduct
      );
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });
};

// Update product mutation (admin only)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productAPI.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Update the product in cache
      queryClient.setQueryData(
        productQueryKeys.detail(id),
        updatedProduct
      );
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
    },
  });
};

// Delete product mutation (admin only)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productAPI.delete,
    onSuccess: (_, deletedId) => {
      // Remove product from cache
      queryClient.removeQueries({ queryKey: productQueryKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });
};

// Prefetch product by slug (useful for hover effects)
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.bySlug(slug),
      queryFn: () => productAPI.getBySlug(slug),
      staleTime: 10 * 60 * 1000,
    });
  };
};
