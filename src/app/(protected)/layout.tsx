import type { FC, ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import AppShell from '@/components/layout/app-shell';

type ProtectedLayoutProps = Readonly<{
  children: ReactNode;
}>;

const ProtectedLayout: FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
