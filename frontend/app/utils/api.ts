// filepath: d:\expoProjects\cardiolive\frontend\app\utils\api.ts

import { AuthResponse, APIResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
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
}

export const apiClient = new ApiClient(API_URL);

// Auth API functions
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/users/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/users/register', { name, email, password }),
  
  forgotPassword: (email: string) =>
    apiClient.post<APIResponse<any>>('/api/users/forgot-password', { email }),
};

// Product API functions
export const productAPI = {
  getAll: () => apiClient.get<any[]>('/api/products'),
  getById: (id: string) => apiClient.get<any>(`/api/products/${id}`),
  create: (data: any) => apiClient.post<any>('/api/products/admin', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/products/admin/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<any>>(`/api/products/admin/${id}`),
};

// Order API functions
export const orderAPI = {
  create: (data: any) => apiClient.post<any>('/api/orders', data),
  getMyOrders: () => apiClient.get<any[]>('/api/orders/my'),
  track: (orderId: string) => apiClient.get<any>(`/api/orders/track/${orderId}`),
  getAll: () => apiClient.get<any[]>('/api/orders/admin'),
  updateStatus: (id: string, status: string) => 
    apiClient.put<any>(`/api/orders/admin/${id}/status`, { status }),
};

// Blog API functions
export const blogAPI = {
  getAll: () => apiClient.get<any[]>('/api/blogs'),
  getById: (id: string) => apiClient.get<any>(`/api/blogs/${id}`),
  create: (data: any) => apiClient.post<any>('/api/blogs/admin', data),
  update: (id: string, data: any) => apiClient.put<any>(`/api/blogs/admin/${id}`, data),
  delete: (id: string) => apiClient.delete<APIResponse<any>>(`/api/blogs/admin/${id}`),
};

// User API functions
export const userAPI = {
  getProfile: () => apiClient.get<any>('/api/users/profile'),
  updateProfile: (data: any) => apiClient.put<any>('/api/users/profile', data),
  getAllUsers: () => apiClient.get<any[]>('/api/users/admin/users'),
  updateUserRole: (id: string, role: string) => 
    apiClient.put<any>(`/api/users/admin/${id}/role`, { role }),
  deleteUser: (id: string) => apiClient.delete<APIResponse<any>>(`/api/users/admin/${id}`),
};
