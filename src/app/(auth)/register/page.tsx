import type { FC } from 'react';
import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register',
};

const RegisterPage: FC = () => {
  return <RegisterForm />;
};

export default RegisterPage;
