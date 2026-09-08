import type { FC } from 'react';
import Skeleton from '@/components/ui/skeleton';

type LoadingStateProps = {
  rows?: number;
};

const LoadingState: FC<LoadingStateProps> = ({ rows = 3 }) => (
  <div className="space-y-4" aria-live="polite" aria-busy="true">
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} className="h-24 w-full" />
    ))}
  </div>
);

export default LoadingState;
