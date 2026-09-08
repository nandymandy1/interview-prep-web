import type { FC, LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

const Label: FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      data-slot="label"
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
};

export default Label;
