import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export const useAsync = <T = unknown>(options: UseAsyncOptions<T> = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'İşlem başarılı',
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction();
        setState({ data, loading: false, error: null });
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(data);
        }
        
        return data;      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        if (onError) {
          onError(errorMessage);
        }
        
        throw error;
      }
    },
    [onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Error message extraction utility
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    if (errorObj.response && typeof errorObj.response === 'object') {
      const response = errorObj.response as Record<string, unknown>;
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === 'string') {
          return data.message;
        }
      }
    }

    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }

    if (errorObj.errors && Array.isArray(errorObj.errors)) {
      return errorObj.errors.join(', ');
    }
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

// Loading states for different UI components
export const useLoadingState = (initialStates: Record<string, boolean> = {}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(initialStates);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
};

// Form submission with loading and error handling
export const useFormSubmission = <T = unknown, F = Record<string, unknown>>(options: UseAsyncOptions<T> = {}) => {
  const { execute, loading, error, reset } = useAsync<T>(options);

  const submitForm = useCallback(
    async (formData: F, submitFunction: (data: F) => Promise<T>) => {
      return execute(() => submitFunction(formData));
    },
    [execute]
  );

  return {
    submitForm,
    isSubmitting: loading,
    error,
    reset,
  };
};

// HTTP request wrapper with better error handling
export const useApiRequest = () => {
  const handleApiError = useCallback((error: unknown) => {
    console.error('API Error:', error);

    // Handle network errors
    if (!error || typeof error !== 'object') {
      return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    }

    const errorObj = error as Record<string, unknown>;
    
    if (!errorObj.response) {
      return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    }

    // Handle HTTP errors
    const response = errorObj.response as Record<string, unknown>;
    const status = response.status as number;
    const data = response.data as Record<string, unknown>;

    switch (status) {
      case 400:
        return (typeof data?.message === 'string' ? data.message : null) || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
      case 401:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz bulunmuyor.';
      case 404:
        return 'İstenen kaynak bulunamadı.';
      case 409:
        return (typeof data?.message === 'string' ? data.message : null) || 'Bu kayıt zaten mevcut.';
      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          return data.errors.join(', ');
        }
        return (typeof data?.message === 'string' ? data.message : null) || 'Doğrulama hatası.';
      case 429:
        return 'Çok fazla istek. Lütfen biraz bekleyin.';
      case 500:
        return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      default:
        return (typeof data?.message === 'string' ? data.message : null) || 'Beklenmeyen bir hata oluştu.';
    }
  }, []);

  return {
    handleApiError,
  };
};

// Toast notifications helper
export const useNotifications = () => {
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
    });
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
