// Standardized API Response Types for CardioLive
// This file contains all standardized response interfaces

import { 
  User, 
  Product, 
  Order, 
  Blog, 
  Review, 
  WishlistItem, 
  PaymentMethod, 
  TrackingInfo 
} from './index';

// Base API Response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationData;
}

// Error Response structure
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string | Record<string, unknown>;
}

// Pagination structure
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Collection Response with pagination
export interface ApiCollectionResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationData;
  message?: string;
}

// Count Response
export interface ApiCountResponse {
  success: true;
  data: {
    count: number;
  };
  message?: string;
}

// Authentication Response
export interface ApiAuthResponse {
  success: true;
  data: {
    token: string;
    user: User;
    expiresIn: string;
  };
  message?: string;
}

// Standard Response Types for specific entities
export type ApiUserResponse = ApiResponse<User>;
export type ApiUsersResponse = ApiCollectionResponse<User>;
export type ApiUserCountResponse = ApiCountResponse;

export type ApiProductResponse = ApiResponse<Product>;
export type ApiProductsResponse = ApiCollectionResponse<Product>;

export type ApiOrderResponse = ApiResponse<Order>;
export type ApiOrdersResponse = ApiCollectionResponse<Order>;

export type ApiBlogResponse = ApiResponse<Blog>;
export type ApiBlogsResponse = ApiCollectionResponse<Blog>;

export type ApiReviewResponse = ApiResponse<Review>;
export type ApiReviewsResponse = ApiCollectionResponse<Review>;

export type ApiWishlistResponse = ApiResponse<WishlistItem[]>;
export type ApiWishlistCountResponse = ApiCountResponse;

// Payment specific responses
export interface ApiPaymentMethodsResponse {
  success: true;
  data: {
    paymentMethods: PaymentMethod[];
  };
  message?: string;
}

export interface ApiPaymentValidationResponse {
  success: true;
  data: {
    valid: boolean;
    errors?: string[];
  };
  message?: string;
}

export interface ApiPaymentProcessResponse {
  success: true;
  data: {
    transactionId?: string;
    reference?: string;
    status: string;
  };
  message?: string;
}

// Generic message response
export interface ApiMessageResponse {
  success: true;
  data?: Record<string, unknown>;
  message: string;
}

// Status check response
export interface ApiStatusResponse<T = unknown> {
  success: true;
  data: {
    status: T;
    [key: string]: unknown;
  };
  message?: string;
}

// Tracking response
export interface ApiTrackingResponse {
  success: true;
  data: TrackingInfo;
  message?: string;
}

// Re-export existing types for backwards compatibility
export * from './index';

// Helper type to extract data from API responses
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;

// Helper type for API call results
export type ApiResult<T> = Promise<T>;

// Type guards for API responses
export function isApiError(response: unknown): response is ApiErrorResponse {
  return typeof response === 'object' && response !== null && 'success' in response && response.success === false;
}

export function isApiSuccess<T>(response: unknown): response is ApiResponse<T> {
  return typeof response === 'object' && response !== null && 'success' in response && response.success === true;
}

// Utility type for API endpoints that return collections
export interface CollectionResult<T> {
  data: T[];
  pagination?: PaginationData;
  total?: number;
}
