// providers/ReactQueryProvider.jsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache time: Data stays in cache for 10 minutes after being unused
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch on window focus for better performance
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect for static data
            refetchOnReconnect: false,
            // Background refetch interval - useful for frequently changing data
            refetchInterval: false,
            // Enable background refetch while user is away
            refetchIntervalInBackground: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// For components that need real-time data, you can override these defaults:
// const { data } = useGetData("live-endpoint", {}, {
//   refetchInterval: 30000, // Refetch every 30 seconds
//   staleTime: 0, // Always consider stale
// });