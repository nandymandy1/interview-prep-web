import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardDescriptionProps = HTMLAttributes<HTMLDivElement>;

const CardDescription: FC<CardDescriptionProps> = ({ className, ...props }) => (
  <div
    data-slot="card-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
);

export default CardDescription;
