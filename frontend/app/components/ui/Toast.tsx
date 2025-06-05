'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { generateId, safeWindow } from '@/utils/ssr';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = generateId('toast');
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastComponentProps {
  toast: Toast;
  onRemove: () => void;
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 200); // Wait for exit animation
  };

  const toastVariants = {
    success: {
      className: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    error: {
      className: 'bg-red-50 border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    },
    info: {
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const variant = toastVariants[toast.type];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 shadow-lg transition-all duration-200 transform',
        variant.className,
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', variant.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{toast.title}</p>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
          aria-label="Bildirimi kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Helper functions for common use cases
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    safeWindow((window) => {
      const event = new CustomEvent('addToast', {
        detail: { type: 'success', title, description, duration },
      });
      window.dispatchEvent(event);
    });
  },
  error: (title: string, description?: string, duration?: number) => {
    safeWindow((window) => {
      const event = new CustomEvent('addToast', {
        detail: { type: 'error', title, description, duration },
      });
      window.dispatchEvent(event);
    });
  },
  warning: (title: string, description?: string, duration?: number) => {
    safeWindow((window) => {
      const event = new CustomEvent('addToast', {
        detail: { type: 'warning', title, description, duration },
      });
      window.dispatchEvent(event);
    });
  },
  info: (title: string, description?: string, duration?: number) => {
    safeWindow((window) => {
      const event = new CustomEvent('addToast', {
        detail: { type: 'info', title, description, duration },
      });
      window.dispatchEvent(event);
    });
  },
};
