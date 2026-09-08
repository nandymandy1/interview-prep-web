import type { FC } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
};

const LoginPage: FC = () => {
  return <LoginForm />;
};

export default LoginPage;
