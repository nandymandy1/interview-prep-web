import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CardTitleProps = HTMLAttributes<HTMLDivElement>;

const CardTitle: FC<CardTitleProps> = ({ className, ...props }) => (
  <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />
);

export default CardTitle;
