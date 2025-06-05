import { 
  AuthResponse, 
  APIResponse, 
  Product, 
  Order, 
  User, 
  Review,
  ReviewStats,
  ReviewEligibility,
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

// Token refresh state
interface TokenRefreshState {
  isRefreshing: boolean;
  failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }>;
}

const tokenRefreshState: TokenRefreshState = {
  isRefreshing: false,
  failedQueue: []
};

// Helper to decode JWT and check expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    // Check if token expires in the next 5 minutes (300 seconds)
    return payload.exp <= (currentTime + 300);
  } catch {
    return true;
  }
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }  private async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    // Basic token format validation
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.warn('Invalid token format detected, removing from localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    // Check if token is expired or will expire soon
    if (!isTokenExpired(token)) {
      return token;
    }

    // Token is expired or will expire soon, try to refresh
    return await this.refreshTokenIfNeeded();
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // If already refreshing, wait for the result
    if (tokenRefreshState.isRefreshing) {
      return new Promise((resolve, reject) => {
        tokenRefreshState.failedQueue.push({ resolve, reject });
      });
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token available, user needs to login again
      this.handleAuthFailure();
      return null;
    }

    tokenRefreshState.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/api/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      
      if (result.success && result.data.accessToken) {
        // Store new tokens
        localStorage.setItem('token', result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }

        // Process the queue
        tokenRefreshState.failedQueue.forEach(({ resolve }) => {
          resolve(result.data.accessToken);
        });
        
        return result.data.accessToken;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Process the failed queue
      tokenRefreshState.failedQueue.forEach(({ reject }) => {
        reject(error as Error);
      });

      this.handleAuthFailure();
      return null;
    } finally {
      tokenRefreshState.isRefreshing = false;
      tokenRefreshState.failedQueue.length = 0;
    }
  }

  private handleAuthFailure(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  private async getAuthHeaders(isFormData: boolean = false): Promise<HeadersInit> {
    const token = await this.getValidToken();
    
    const headers: HeadersInit = {};
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }private async handleResponse<T>(response: Response): Promise<T> {
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
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: { headers?: HeadersInit }): Promise<T> {
    const isFormData = data instanceof FormData;
    const headers = {
      ...(await this.getAuthHeaders(isFormData)),
      ...options?.headers
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
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
    refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/api/users/refresh-token', { refreshToken }),
  
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
    apiClient.patch<Review>(`/api/reviews/admin/${reviewId}/status`, { status }),  // Check if user can review a product (purchase verification)
  checkCanReview: async (productId: string): Promise<ReviewEligibility> => {
    const response = await apiClient.get<{ success: boolean; message: string; data: ReviewEligibility; timestamp: string }>(`/api/reviews/can-review/${productId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to check review eligibility');
  },
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

// Upload API
interface UploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
  url: string;
}

export const uploadAPI = {
  uploadSingle: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file); // Backend expects 'image' field name
    
    const response = await apiClient.post<{ success: boolean; data: UploadResponse }>('/api/upload/single', formData);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error('Upload failed');
    }
  },
  
  uploadMultiple: async (files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file); // Backend expects 'images' field name for multiple
    });
    
    const response = await apiClient.post<{ success: boolean; data: UploadResponse[] }>('/api/upload/multiple', formData);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error('Upload failed');
    }
  },
  
  deleteFile: async (filename: string, folder?: string): Promise<void> => {
    const url = folder ? `/api/upload/${filename}?folder=${folder}` : `/api/upload/${filename}`;
    await apiClient.delete(url);
  },
    listFiles: async (folder?: string) => {
    const url = folder ? `/api/upload/list?folder=${folder}` : '/api/upload/list';
    const response = await apiClient.get<{ success: boolean; data: { files: UploadResponse[] } }>(url);
    return response.data.files;
  }
};
