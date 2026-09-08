import type { FC, ReactNode } from 'react';
import AuthShell from '@/components/auth/auth-shell';

type AuthLayoutProps = Readonly<{
  children: ReactNode;
}>;

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return <AuthShell>{children}</AuthShell>;
};

export default AuthLayout;
