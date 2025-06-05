// filepath: d:\expoProjects\cardiolive\frontend\app\types\index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  images: string[];
  category: 'Sızma Zeytinyağı' | 'Naturel Zeytinyağı' | 'Organik Zeytinyağı' | 'Özel Seri';
  stock: number;
  size: '250ml' | '500ml' | '1L' | '2L' | '5L';
  isActive: boolean;
  featured: boolean;
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
  orderNumber: string;
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
  slug: string;
  excerpt: string;
  summary?: string; // alias for excerpt
  content: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  viewCount?: number;
  publishedAt?: string;
  image: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy support
  date?: string; // for backward compatibility
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

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fees: number;
}

export interface PaymentDetails {
  // Credit Card
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardHolder?: string;
  
  // Bank Transfer
  bankAccount?: string;
  routingNumber?: string;
  bankName?: string;
  
  // Common
  billingAddress?: ShippingAddress;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  transactionId?: string;
  amount?: number;
  method?: string;
  error?: string;
}

export interface TrackingInfo {
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  trackingNumber: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
  };
  statusHistory: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

export interface OrderPayment {
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  reference?: string;
  paidAt?: string;
  amount: number;
  fees?: number;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; email?: string };
  rating: number;
  title?: string;
  comment: string;
  isActive: boolean;
  helpfulCount: number;
  createdAt: string;
  isVerifiedPurchase?: boolean;
  helpfulVotes?: {
    helpful: number;
    notHelpful: number;
  };
  userHasVoted?: 'helpful' | 'not_helpful' | null;
}

export interface ReviewStats {  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
  title?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  title?: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  hasPurchased: boolean;
  hasExistingReview: boolean;
  reason?: string;
}
