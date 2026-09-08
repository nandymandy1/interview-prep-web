'use client';

import type { FC, ReactNode } from 'react';
import QueryClientProviderRoot from '@/providers/query-client.provider';
import Toaster from '@/components/ui/toaster';

type AppProviderProps = Readonly<{
  children: ReactNode;
}>;

const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProviderRoot>
      {children}
      <Toaster />
    </QueryClientProviderRoot>
  );
};

export default AppProvider;
