import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageContainerProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const PageContainer: FC<PageContainerProps> = ({ children, className }) => (
  <main className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8', className)}>
    {children}
  </main>
);

export default PageContainer;
