'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {        queries: {
            // Stale time: The time in milliseconds that cache data remains fresh
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache time: The time in milliseconds that cache data remains in memory
            gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
            // Retry failed requests
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors except 408, 429
              const errorObj = error as { status?: number };
              if (errorObj?.status && errorObj.status >= 400 && errorObj.status < 500 && ![408, 429].includes(errorObj.status)) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Refetch on network reconnect
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry failed mutations
            retry: (failureCount, error: unknown) => {
              // Don't retry client errors (4xx) except network issues
              const errorObj = error as { status?: number };
              if (errorObj?.status && errorObj.status >= 400 && errorObj.status < 500) {
                return false;
              }
              // Retry up to 2 times for server errors
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
