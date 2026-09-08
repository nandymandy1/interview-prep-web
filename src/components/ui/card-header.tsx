import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

const CardHeader: FC<CardHeaderProps> = ({ className, ...props }) => (
  <div data-slot="card-header" className={cn('grid gap-1.5 px-6', className)} {...props} />
);

export default CardHeader;
