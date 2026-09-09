import type { FC } from 'react';
import { redirect } from 'next/navigation';
import { APP_ROUTES } from '@/constants';

const HomePage: FC = () => {
  redirect(APP_ROUTES.login);
};

export default HomePage;
