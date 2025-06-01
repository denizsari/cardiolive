'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Generic fetch hook with error handling and loading states
export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    immediate?: boolean;
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { immediate = true, onError, onSuccess } = options;

  const execute = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      
      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
        setLastFetch(new Date());
        onSuccess?.(result);
      }
    } catch (err) {
      // Only update error state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        onError?.(error);
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFunction, onError, onSuccess]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
  }, []);
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...dependencies]);

  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    retry,
    reset,
    isStale: lastFetch ? Date.now() - lastFetch.getTime() > 5 * 60 * 1000 : true // 5 minutes
  };
}

// Hook for API calls with automatic error handling
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: {
    immediate?: boolean;
    errorMessage?: string;
    successMessage?: string;
    showToast?: boolean;
  } = {}
) {
  const { errorMessage = 'Bir hata oluştu', successMessage, showToast = false } = options;

  return useFetch(
    apiCall,
    dependencies,
    {
      immediate: options.immediate,
      onError: (error) => {
        console.error('API call failed:', error);
        if (showToast) {
          // In a real app, you'd integrate with a toast library here
          console.error(errorMessage, error.message);
        }
      },
      onSuccess: () => {
        if (successMessage && showToast) {
          // In a real app, you'd integrate with a toast library here
          console.log(successMessage);
        }
      }
    }
  );
}

// Hook for form submissions with loading states
export function useFormSubmit<T, FormData = Record<string, unknown>>(
  submitFunction: (data: FormData) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitFunction(formData);
      setSuccess(true);
      options.onSuccess?.(result);
      
      if (options.resetOnSuccess) {
        setTimeout(() => setSuccess(false), 3000);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Submission failed');
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [submitFunction, options]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
}
