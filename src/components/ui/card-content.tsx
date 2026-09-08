import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

const CardContent: FC<CardContentProps> = ({ className, ...props }) => (
  <div data-slot="card-content" className={cn('px-6', className)} {...props} />
);

export default CardContent;
