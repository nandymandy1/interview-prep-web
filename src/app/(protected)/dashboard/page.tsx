import type { FC } from 'react';
import type { Metadata } from 'next';
import DashboardView from '@/components/dashboard/dashboard-view';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const DashboardPage: FC = () => {
  return <DashboardView />;
};

export default DashboardPage;
