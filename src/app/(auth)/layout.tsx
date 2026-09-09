import type { FC, ReactNode } from 'react';
import AuthShell from '@/components/auth/auth-shell';
import GuestRoute from '@/components/auth/guest-route';

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <GuestRoute>
      <AuthShell>{children}</AuthShell>
    </GuestRoute>
  );
};

export default AuthLayout;
