import type { FC } from 'react';
import { cn } from '@/lib/utils';

type ProgressProps = {
  value: number;
  className?: string;
};

const Progress: FC<ProgressProps> = ({ value, className }) => {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      data-slot="progress"
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <div
        className="h-full bg-primary transition-[width]"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
};

export default Progress;
