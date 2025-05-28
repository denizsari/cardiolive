// filepath: d:\expoProjects\cardiolive\frontend\app\types\index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'Sızma Zeytinyağı' | 'Naturel Zeytinyağı' | 'Organik Zeytinyağı' | 'Özel Seri';
  stock: number;
  size: '250ml' | '500ml' | '1L' | '2L' | '5L';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: string | User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'cash_on_delivery' | 'credit_card' | 'bank_transfer';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  businessInfo: {
    taxNumber?: string;
    commercialRegistration?: string;
    mersisNumber?: string;
  };
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}
