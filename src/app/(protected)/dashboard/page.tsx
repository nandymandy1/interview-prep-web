import { Suspense, type FC } from 'react';
import type { Metadata } from 'next';
import LoadingState from '@/components/common/loading-state';
import DashboardView from '@/components/dashboard/dashboard-view';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const DashboardPage: FC = () => {
  return (
    <Suspense fallback={<LoadingState rows={4} />}>
      <DashboardView />
    </Suspense>
  );
};

export default DashboardPage;
