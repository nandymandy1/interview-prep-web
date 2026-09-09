import { CircleCheckBig, CircleX, Clock3, LoaderCircle } from 'lucide-react';
import type { FC } from 'react';
import Badge from '@/components/ui/badge';
import type { GenerationStatus } from '@/types/kits/kit.type';

type KitStatusBadgeProps = {
  status: GenerationStatus;
};

const STATUS_META: Record<
  GenerationStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; spin?: boolean }
> = {
  queued: { label: 'Queued', variant: 'secondary' },
  running: { label: 'Generating', variant: 'secondary', spin: true },
  completed: { label: 'Ready', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

const KitStatusBadge: FC<KitStatusBadgeProps> = ({ status }) => {
  const meta = STATUS_META[status];
  const Icon =
    status === 'queued'
      ? Clock3
      : status === 'running'
        ? LoaderCircle
        : status === 'completed'
          ? CircleCheckBig
          : CircleX;

  return (
    <Badge variant={meta.variant}>
      <Icon className={meta.spin ? 'size-3 animate-spin' : 'size-3'} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

export default KitStatusBadge;
