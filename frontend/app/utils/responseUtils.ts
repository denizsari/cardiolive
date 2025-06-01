// Simplified API Response Utilities
// Provides consistent response handling for CardioLive API

// Simplified API Response Utilities
// Provides consistent response handling for CardioLive API

/**
 * Safely extracts data from API responses with different structures
 */
export function extractData<T>(response: unknown): T {
  // Handle standard format { success: true, data: T }
  if (response && typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>;
    if (responseObj.success === true && responseObj.data !== undefined) {
      return responseObj.data as T;
    }
    
    // Handle direct data response
    if (responseObj.success === undefined) {
      return response as T;
    }
  }
  
  // Handle null/undefined
  if (!response) {
    throw new Error('No response data received');
  }
  
  return response as T;
}

/**
 * Safely extracts array data from collection responses
 */
export function extractArray<T>(response: unknown): T[] {
  // Handle standard collection format
  if (response && typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>;
    
    if (responseObj.success === true && responseObj.data) {
      // Check for nested arrays (products, blogs, orders, etc.)
      const data = responseObj.data as Record<string, unknown>;
      if (data.products && Array.isArray(data.products)) return data.products as T[];
      if (data.blogs && Array.isArray(data.blogs)) return data.blogs as T[];
      if (data.orders && Array.isArray(data.orders)) return data.orders as T[];
      if (data.users && Array.isArray(data.users)) return data.users as T[];
      if (data.reviews && Array.isArray(data.reviews)) return data.reviews as T[];
      
      // Handle direct array in data
      if (Array.isArray(responseObj.data)) return responseObj.data as T[];
    }
    
    // Handle direct array response
    if (Array.isArray(response)) {
      return response as T[];
    }
    
    // Handle nested data arrays
    if (responseObj.data && Array.isArray(responseObj.data)) {
      return responseObj.data as T[];
    }
  }
  
  // Return empty array as fallback
  return [];
}

/**
 * Safely extracts count from count responses
 */
export function extractCount(response: unknown): number {
  if (response && typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>;
    
    if (responseObj.success === true && responseObj.data && typeof responseObj.data === 'object' && responseObj.data !== null) {
      const data = responseObj.data as Record<string, unknown>;
      if (typeof data.count === 'number') {
        return data.count;
      }
    }
    
    if (typeof responseObj.count === 'number') {
      return responseObj.count;
    }
  }
  
  return 0;
}

/**
 * Creates standardized error from various error formats
 */
export function createStandardError(error: unknown, defaultMessage: string = 'An error occurred'): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (error && typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return new Error(errorObj.message);
    }
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error(defaultMessage);
}

/**
 * Wrapper for safe API calls with error handling
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<unknown>,
  errorMessage: string = 'API call failed'
): Promise<T> {
  try {
    const response = await apiCall();
    return extractData<T>(response);
  } catch (error: unknown) {
    throw createStandardError(error, errorMessage);
  }
}

/**
 * Wrapper for safe collection API calls
 */
export async function safeCollectionCall<T>(
  apiCall: () => Promise<unknown>,
  errorMessage: string = 'Failed to fetch collection'
): Promise<T[]> {
  try {
    const response = await apiCall();
    return extractArray<T>(response);
  } catch (error: unknown) {
    throw createStandardError(error, errorMessage);
  }
}

/**
 * Wrapper for safe count API calls
 */
export async function safeCountCall(
  apiCall: () => Promise<unknown>
): Promise<number> {
  try {
    const response = await apiCall();
    return extractCount(response);
  } catch (error: unknown) {
    console.error('Count API call failed:', error);
    return 0; // Return 0 instead of throwing for count calls
  }
}
