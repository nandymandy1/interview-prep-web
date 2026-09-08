'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FC, type ReactNode, useState } from 'react';

type QueryClientProviderRootProps = Readonly<{
  children: ReactNode;
}>;

const QueryClientProviderRoot: FC<QueryClientProviderRootProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryClientProviderRoot;
