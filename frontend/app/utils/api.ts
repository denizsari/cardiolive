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

// Define proper types for API responses
interface BlogPost {
  _id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  author: string;
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
  summary: string;
  image: string;
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
};

// Product API functions
export const productAPI = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: Product[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; hasNext: boolean; hasPrev: boolean } }>('/api/products');
    return response.data || [];
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/products/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/products/slug/${slug}`);
    return response.data;
  },
  create: (data: CreateProductData) => apiClient.post<Product>('/api/products', data),
  update: (id: string, data: Partial<CreateProductData>) => apiClient.put<Product>(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<string>>(`/api/products/${id}`),
};

// Order API functions
export const orderAPI = {
  create: (data: CreateOrderData) => apiClient.post<Order>('/api/orders', data),
  getMyOrders: async () => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>('/api/orders');
    return response.data;
  },
  track: async (orderNumber: string): Promise<TrackingInfo> => {
    const response = await apiClient.get<{ success: boolean; data: TrackingInfo }>(`/api/orders/track/${orderNumber}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`/api/orders/${id}`);
    return response.data;
  },
  cancel: (id: string) => apiClient.patch<Order>(`/api/orders/${id}/cancel`, {}),
  // Admin functions
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: Order[] }>('/api/orders/admin');
    return response.data;
  },
  updateStatus: (id: string, status: string) => 
    apiClient.patch<Order>(`/api/orders/admin/${id}/status`, { status }),
};

// Blog API functions
export const blogAPI = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: { blogs: BlogPost[]; pagination: { currentPage: number; totalPages: number; totalBlogs: number; hasNext: boolean; hasPrev: boolean }; count: number } }>('/api/blogs');
    return response.data?.blogs || [];
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: BlogPost }>(`/api/blogs/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await apiClient.get<{ success: boolean; data: BlogPost }>(`/api/blogs/slug/${slug}`);
    return response.data;
  },
  create: (data: CreateBlogData) => apiClient.post<BlogPost>('/api/blogs', data),
  update: (id: string, data: Partial<CreateBlogData>) => apiClient.put<BlogPost>(`/api/blogs/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<string>>(`/api/blogs/${id}`),
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/api/users/profile');
    return response.data;
  },
  updateProfile: (data: UpdateProfileData) => apiClient.put<UpdateProfileResponse>('/api/users/profile', data),
  changePassword: (currentPassword: string, newPassword: string) => 
    apiClient.put<{ message: string }>('/api/users/change-password', { currentPassword, newPassword }),
  // Admin functions
  getAllUsers: async () => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/api/users/admin/all');
    return response.data || [];
  },
  updateUserRole: (userId: string, role: string) => 
    apiClient.put<User>(`/api/users/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId: string, isActive: boolean) => 
    apiClient.put<User>(`/api/users/admin/users/${userId}/status`, { isActive }),
  deleteUser: (userId: string) => apiClient.delete<APIResponse<string>>(`/api/users/admin/users/${userId}`),
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
    const response = await apiClient.get<{ success: boolean; data: Review[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number; hasNext: boolean; hasPrev: boolean } }>(`/api/reviews/product/${productId}${params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''}`);
    return response.data;
  },
  getReviewStats: async (productId: string) => {
    const response = await apiClient.get<{ success: boolean; data: ReviewStats }>(`/api/reviews/stats/${productId}`);
    return response.data;
  },
  createReview: (data: CreateReviewData) => 
    apiClient.post<Review>('/api/reviews', data),
  updateReview: (reviewId: string, data: UpdateReviewData) => 
    apiClient.put<Review>(`/api/reviews/${reviewId}`, data),
  deleteReview: (reviewId: string) => 
    apiClient.delete<APIResponse<string>>(`/api/reviews/${reviewId}`),
  markHelpful: (reviewId: string) => 
    apiClient.patch<Review>(`/api/reviews/${reviewId}/helpful`, {}),
  // Admin functions
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
    const response = await apiClient.get<{ success: boolean; data: { inWishlist: boolean } }>(`/api/wishlist/check/${productId}`);
    return response.data.inWishlist;
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
