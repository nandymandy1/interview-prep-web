import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardProps = HTMLAttributes<HTMLDivElement>;

const Card: FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card"
      className={cn('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
};

export default Card;
