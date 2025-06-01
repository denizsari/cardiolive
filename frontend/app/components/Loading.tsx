'use client';

import React from 'react';

// Generic loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-[#70BB1B] ${sizeClasses[size]} ${className}`} />
  );
}

// Loading state component with optional message
export function LoadingState({ 
  message = 'Yükleniyor...', 
  className = '' 
}: { 
  message?: string; 
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );
}

// Page loading overlay
export function PageLoading() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600">Sayfa yükleniyor...</p>
      </div>
    </div>
  );
}

// Button loading state
export function ButtonLoading({ 
  children, 
  loading = false, 
  ...props 
}: { 
  children: React.ReactNode; 
  loading?: boolean; 
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Yükleniyor...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Table skeleton loader
export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number;
}) {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-100 rounded mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-100 rounded mb-3 w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        <div className="h-24 bg-gray-100 rounded"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

// Inline loading for small spaces
export function InlineLoading({ text = 'Yükleniyor...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <LoadingSpinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

// Dashboard stats skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-8 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
