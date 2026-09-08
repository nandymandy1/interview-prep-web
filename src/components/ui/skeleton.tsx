import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton: FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    data-slot="skeleton"
    className={cn('bg-muted animate-pulse rounded-md', className)}
    {...props}
  />
);

export default Skeleton;
