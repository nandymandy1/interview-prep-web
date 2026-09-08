import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageContainerProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

const PageContainer: FC<PageContainerProps> = ({ children, className }) => (
  <main className={cn('mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8', className)}>
    {children}
  </main>
);

export default PageContainer;
