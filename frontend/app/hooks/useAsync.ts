import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export const useAsync = <T = any>(options: UseAsyncOptions = {}) => {
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
        
        return data;
      } catch (error: any) {
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
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.join(', ');
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
export const useFormSubmission = <T = any>(options: UseAsyncOptions = {}) => {
  const { execute, loading, error, reset } = useAsync<T>(options);

  const submitForm = useCallback(
    async (formData: any, submitFunction: (data: any) => Promise<T>) => {
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
  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);

    // Handle network errors
    if (!error.response) {
      return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    }

    // Handle HTTP errors
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data?.message || 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
      case 401:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz bulunmuyor.';
      case 404:
        return 'İstenen kaynak bulunamadı.';
      case 409:
        return data?.message || 'Bu kayıt zaten mevcut.';
      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          return data.errors.join(', ');
        }
        return data?.message || 'Doğrulama hatası.';
      case 429:
        return 'Çok fazla istek. Lütfen biraz bekleyin.';
      case 500:
        return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      default:
        return data?.message || 'Beklenmeyen bir hata oluştu.';
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
