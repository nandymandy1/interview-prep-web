import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton: FC<SkeletonProps> = ({ className, ...props }) => (
  <div data-slot="skeleton" className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
);

export default Skeleton;
