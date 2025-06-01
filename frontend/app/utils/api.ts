import { 
  AuthResponse, 
  APIResponse, 
  Product, 
  Order, 
  User, 
  Review,
  ReviewStats,
  WishlistItem,
  CreateReviewData,
  UpdateReviewData,
  TrackingInfo
} from '@/types';

import {
  safeApiCall,
  safeCollectionCall,
  safeCountCall
} from '@/utils/responseUtils';

// Define proper types for API responses
interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
}

interface APIPaymentMethod {
  id: string;
  name: string;
  type: string;
}

interface APIPaymentDetails {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  paypalEmail?: string;
  [key: string]: unknown;
}

interface CreateProductData {
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
}

interface CreateOrderData {
  items: { product: string; quantity: number; price: number; name: string }[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  total: number;
  notes?: string;
}

interface CreateBlogData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
}

interface Settings {
  [key: string]: unknown;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  user: User;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    
    // Basic token validation before sending
    if (token && (!token.includes('.') || token.split('.').length !== 3)) {
      console.warn('Invalid token format detected, removing from localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { 'Content-Type': 'application/json' };
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the new ResponseHandler format from backend
    if (result.success === false) {
      throw new Error(result.message || 'API Error');
    }
    
    // Return the full result to let individual API functions extract what they need
    return result as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_URL);

// Auth API functions
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/users/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/users/register', { name, email, password }),
  
  forgotPassword: (email: string) =>
    apiClient.post<APIResponse<string>>('/api/users/forgot-password', { email }),
  
  // CRITICAL MISSING ENDPOINTS - IMPLEMENTING NOW
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<APIResponse<string>>('/api/users/reset-password', { token, newPassword }),
  
  refreshToken: () =>
    apiClient.post<AuthResponse>('/api/users/refresh-token'),
  
  logout: () =>
    apiClient.post<APIResponse<string>>('/api/users/logout'),
};

// Product API functions with improved response handling
export const productAPI = {
  // Base product endpoints - CRITICAL MISSING
  getAll: async (): Promise<Product[]> => {
    return safeCollectionCall<Product>(
      () => apiClient.get<{ success: boolean; data: { products: Product[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; hasNext: boolean; hasPrev: boolean } } }>('/api/products'),
      'Failed to fetch products'
    );
  },
  
  // Admin product endpoints - CRITICAL MISSING  
  getAllAdmin: async (): Promise<Product[]> => {
    return safeCollectionCall<Product>(
      () => apiClient.get<{ success: boolean; data: { products: Product[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; hasNext: boolean; hasPrev: boolean } } }>('/api/products/admin/all'),
      'Failed to fetch admin products'
    );
  },
  
  getById: async (id: string): Promise<Product> => {
    return safeApiCall<Product>(
      () => apiClient.get<{ success: boolean; data: Product }>(`/api/products/${id}`),
      'Failed to fetch product'
    );
  },
  
  getBySlug: async (slug: string): Promise<Product> => {
    return safeApiCall<Product>(
      () => apiClient.get<{ success: boolean; data: Product }>(`/api/products/slug/${slug}`),
      'Failed to fetch product by slug'
    );
  },
  
  create: (data: CreateProductData) => apiClient.post<Product>('/api/products', data),
  
  // Admin-specific product management - CRITICAL MISSING
  createAdmin: (data: CreateProductData) => apiClient.post<Product>('/api/products/admin', data),
  updateAdmin: (id: string, data: Partial<CreateProductData>) => apiClient.put<Product>(`/api/products/admin/${id}`, data),
  deleteAdmin: (id: string) => apiClient.delete<APIResponse<string>>(`/api/products/admin/${id}`),
  
  update: (id: string, data: Partial<CreateProductData>) => apiClient.put<Product>(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<string>>(`/api/products/${id}`),
};

// Order API functions with improved response handling
export const orderAPI = {
  create: (data: CreateOrderData) => apiClient.post<Order>('/api/orders', data),
  
  // FIXED: Updated to match backend endpoint (/api/orders/user instead of /api/orders)
  getMyOrders: async (): Promise<Order[]> => {
    return safeCollectionCall<Order>(
      () => apiClient.get<{ success: boolean; data: Order[] }>('/api/orders/user'),
      'Failed to fetch user orders'
    );
  },
  
  track: async (orderNumber: string): Promise<TrackingInfo> => {
    return safeApiCall<TrackingInfo>(
      () => apiClient.get<{ success: boolean; data: TrackingInfo }>(`/api/orders/track/${orderNumber}`),
      'Failed to track order'
    );
  },
  
  getById: async (id: string): Promise<Order> => {
    return safeApiCall<Order>(
      () => apiClient.get<{ success: boolean; data: Order }>(`/api/orders/${id}`),
      'Failed to fetch order'
    );
  },
  
  cancel: (id: string) => apiClient.patch<Order>(`/api/orders/${id}/cancel`, {}),
  
  // Admin functions
  getAll: async (): Promise<Order[]> => {
    return safeCollectionCall<Order>(
      () => apiClient.get<{ success: boolean; data: Order[] }>('/api/orders/admin'),
      'Failed to fetch all orders'
    );
  },
    updateStatus: (id: string, status: string) => 
    apiClient.patch<Order>(`/api/orders/admin/${id}/status`, { status }),
  
  // Payment update method for checkout process
  updatePayment: (orderId: string, paymentData: {
    paymentMethod: string;
    paymentStatus: string;
    paymentReference?: string;
    paidAt: string;
  }) => apiClient.patch<Order>(`/api/orders/${orderId}/payment`, paymentData)
};

// Blog API functions with improved response handling
export const blogAPI = {
  getAll: async (): Promise<BlogPost[]> => {
    return safeCollectionCall<BlogPost>(
      () => apiClient.get<{ success: boolean; data: { blogs: BlogPost[]; pagination: { currentPage: number; totalPages: number; totalBlogs: number; hasNext: boolean; hasPrev: boolean }; count: number } }>('/api/blogs'),
      'Failed to fetch blogs'
    );
  },
  
  // CRITICAL MISSING: Featured blogs for homepage
  getFeatured: async (): Promise<BlogPost[]> => {
    return safeCollectionCall<BlogPost>(
      () => apiClient.get<{ success: boolean; data: BlogPost[] }>('/api/blogs/featured'),
      'Failed to fetch featured blogs'
    );
  },
  
  // CRITICAL MISSING: Blog categories for navigation
  getCategories: async (): Promise<string[]> => {
    return safeCollectionCall<string>(
      () => apiClient.get<{ success: boolean; data: string[] }>('/api/blogs/categories'),
      'Failed to fetch blog categories'
    );
  },
  
  getById: async (id: string): Promise<BlogPost> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { blog: BlogPost } }>(`/api/blogs/${id}`);
      if (response.success && response.data && response.data.blog) {
        return response.data.blog;
      }
      throw new Error('Blog post not found');
    } catch (err) {
      console.error('Error fetching blog:', err);
      throw new Error('Failed to fetch blog post');
    }
  },
  
  getBySlug: async (slug: string): Promise<BlogPost> => {
    return safeApiCall<BlogPost>(
      () => apiClient.get<{ success: boolean; data: BlogPost }>(`/api/blogs/slug/${slug}`),
      'Failed to fetch blog post by slug'
    );
  },
  
  // CRITICAL MISSING: Related blogs for blog detail page
  getRelated: async (id: string): Promise<BlogPost[]> => {
    return safeCollectionCall<BlogPost>(
      () => apiClient.get<{ success: boolean; data: BlogPost[] }>(`/api/blogs/${id}/related`),
      'Failed to fetch related blogs'
    );
  },
  
  create: (data: CreateBlogData) => apiClient.post<BlogPost>('/api/blogs', data),
  update: (id: string, data: Partial<CreateBlogData>) => apiClient.put<BlogPost>(`/api/blogs/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<string>>(`/api/blogs/${id}`),
};

// User API functions with improved response handling
export const userAPI = {
  // FIXED: Updated to match backend endpoint (/api/users/me instead of /api/users/profile)
  getProfile: async (): Promise<User> => {
    return safeApiCall<User>(
      () => apiClient.get<{ success: boolean; data: User }>('/api/users/me'),
      'Failed to fetch user profile'
    );
  },
  
  updateProfile: (data: UpdateProfileData) => apiClient.put<UpdateProfileResponse>('/api/users/profile', data),
  changePassword: (currentPassword: string, newPassword: string) => 
    apiClient.put<{ message: string }>('/api/users/change-password', { currentPassword, newPassword }),
  
  // Admin functions
  getAllUsers: async (): Promise<User[]> => {
    return safeCollectionCall<User>(
      () => apiClient.get<{ success: boolean; data: User[] }>('/api/users/all'),
      'Failed to fetch all users'
    );
  },
    // CRITICAL MISSING: Admin users endpoint for proper admin panel
  getAllUsersAdmin: async (): Promise<User[]> => {
    return safeCollectionCall<User>(
      () => apiClient.get<{ success: boolean; data: User[] }>('/api/users/admin/users'),
      'Failed to fetch admin users list'
    );
  },
  
  updateUserRole: (userId: string, role: string) => 
    apiClient.put<User>(`/api/users/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId: string, isActive: boolean) => 
    apiClient.put<User>(`/api/users/admin/users/${userId}/status`, { isActive }),
  deleteUser: (userId: string) => 
    apiClient.delete<APIResponse<string>>(`/api/users/admin/users/${userId}`),
  
  // Get user count for admin dashboard
  getUserCount: async (): Promise<number> => {
    return safeCountCall(
      () => apiClient.get<{ success: boolean; data: { count: number } }>('/api/users/count')
    );
  },
};

// Payment API functions
export const paymentAPI = {
  getMethods: () => apiClient.get<{ success: boolean; paymentMethods: APIPaymentMethod[] }>('/api/payments/methods'),
  validateDetails: (method: string, details: APIPaymentDetails) => 
    apiClient.post<{ success: boolean; valid: boolean; errors?: string[] }>('/api/payments/validate', { paymentMethod: method, paymentDetails: details }),
  processPayment: (orderId: string, method: string, details: APIPaymentDetails) => 
    apiClient.post<{ success: boolean; transactionId?: string; reference?: string; message?: string }>('/api/payments/process', { orderId, paymentMethod: method, paymentDetails: details }),
};

// Review API functions
export const reviewAPI = {
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const response = await apiClient.get<{ success: boolean; data: { reviews: Review[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; hasNext: boolean; hasPrev: boolean } } }>(`/api/reviews/product/${productId}${params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''}`);
    return response.data;
  },
  getReviewStats: async (productId: string) => {
    const response = await apiClient.get<{ success: boolean; data: ReviewStats }>(`/api/reviews/stats/${productId}`);
    return response.data;
  },
  
  // CRITICAL MISSING: User reviews history
  getUserReviews: async (): Promise<Review[]> => {
    return safeCollectionCall<Review>(
      () => apiClient.get<{ success: boolean; data: Review[] }>('/api/reviews/user'),
      'Failed to fetch user reviews'
    );
  },
  
  createReview: (data: CreateReviewData) => 
    apiClient.post<Review>('/api/reviews', data),
  updateReview: (reviewId: string, data: UpdateReviewData) => 
    apiClient.put<Review>(`/api/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => 
    apiClient.delete<APIResponse<string>>(`/api/reviews/${reviewId}`),
  markHelpful: (reviewId: string) => 
    apiClient.patch<Review>(`/api/reviews/${reviewId}/helpful`, {}),
  
  // Admin functions - CRITICAL MISSING: Admin review management
  getAllReviews: async (): Promise<Review[]> => {
    return safeCollectionCall<Review>(
      () => apiClient.get<{ success: boolean; data: Review[] }>('/api/reviews/admin/all'),
      'Failed to fetch all reviews'
    );
  },
  deleteReviewAdmin: (reviewId: string) => 
    apiClient.delete<APIResponse<string>>(`/api/reviews/admin/${reviewId}`),
  updateReviewStatus: (reviewId: string, status: string) => 
    apiClient.patch<Review>(`/api/reviews/admin/${reviewId}/status`, { status }),
};

// Wishlist API functions
export const wishlistAPI = {
  getWishlist: async () => {
    const response = await apiClient.get<{ success: boolean; data: WishlistItem[]; count: number }>('/api/wishlist');
    return response.data;
  },
  getWishlistCount: async () => {
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>('/api/wishlist/count');
    return response.data.count;
  },
  checkWishlistStatus: async (productId: string) => {
    const response = await apiClient.get<{ success: boolean; data: { inWishlist: boolean; addedAt: string | null } }>(`/api/wishlist/check/${productId}`);
    return response.data;
  },
  addToWishlist: (productId: string) => 
    apiClient.post<{ message: string }>('/api/wishlist', { productId }),
  removeFromWishlist: (productId: string) => 
    apiClient.delete<{ message: string }>(`/api/wishlist/${productId}`),
  clearWishlist: () => 
    apiClient.delete<{ message: string }>('/api/wishlist'),
  addMultiple: (productIds: string[]) => 
    apiClient.post<{ message: string }>('/api/wishlist/bulk-add', { productIds }),
  removeMultiple: (productIds: string[]) => 
    apiClient.post<{ message: string }>('/api/wishlist/bulk-remove', { productIds }),
  updateNotes: (productId: string, notes: string) => 
    apiClient.patch<{ message: string }>(`/api/wishlist/${productId}/notes`, { notes }),
};

// Settings API functions - CRITICAL MISSING
export const settingsAPI = {
  getPublicSettings: async () => {
    return safeApiCall<Settings>(
      () => apiClient.get<{ success: boolean; data: Settings }>('/api/settings/public'),
      'Failed to fetch public settings'
    );
  },
  
  // Admin settings management
  getAllSettings: async () => {
    return safeApiCall<Settings>(
      () => apiClient.get<{ success: boolean; data: Settings }>('/api/settings'),
      'Failed to fetch admin settings'
    );
  },
  
  getSettingsByCategory: async (category: string) => {
    return safeApiCall<Settings>(
      () => apiClient.get<{ success: boolean; data: Settings }>(`/api/settings/category?category=${category}`),
      'Failed to fetch settings by category'
    );
  },
  
  updateSettings: (settings: Settings) => 
    apiClient.put<APIResponse<string>>('/api/settings', settings),
    
  resetSettings: () => 
    apiClient.post<APIResponse<string>>('/api/settings/reset'),
};
