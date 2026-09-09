'use client';

import Link from 'next/link';
import type { FC } from 'react';
import {
  ArrowLeft,
  Circle,
  CircleCheckBig,
  CircleMinus,
  CircleX,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Progress from '@/components/ui/progress';
import KitStatusBadge from '@/components/kits/kit-status-badge';
import { generationStageIcon } from '@/components/kits/generation-stages';
import { APP_ROUTES } from '@/constants';
import { useRetryKitGeneration } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';
import type { GenerationStep, KitStatusResult } from '@/types/kits/kit.type';
import { cn } from '@/lib/utils';

type GenerationProgressProps = {
  status: KitStatusResult;
  kitId: string;
};

// Terminal and active states override with state icons; pending steps show
// their stage icon from the centralized metadata, unknown keys fall back to
// the neutral Circle.
const stepIcon = (step: GenerationStep) => {
  switch (step.state) {
    case 'completed':
      return { Icon: CircleCheckBig, className: 'text-primary' };
    case 'running':
      return { Icon: LoaderCircle, className: 'animate-spin text-primary' };
    case 'failed':
      return { Icon: CircleX, className: 'text-destructive' };
    case 'skipped':
      return { Icon: CircleMinus, className: 'text-muted-foreground' };
    default:
      return { Icon: generationStageIcon(step.key) ?? Circle, className: 'text-muted-foreground' };
  }
};

const GenerationProgress: FC<GenerationProgressProps> = ({ status, kitId }) => {
  const failed = status.status === 'failed';
  const done = status.status === 'completed';
  const retry = useRetryKitGeneration(kitId);

  return (
    <div className="space-y-6">
      <section className="space-y-5 rounded-xl border p-6" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            {done ? (
              <CircleCheckBig className="size-5 text-primary" aria-hidden="true" />
            ) : failed ? (
              <TriangleAlert className="size-5 text-destructive" aria-hidden="true" />
            ) : (
              <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Preparing your interview kit</h2>
              <KitStatusBadge status={status.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This can take a little while. You can leave this page and reopen the kit later.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-sm font-medium">
              {failed ? 'Generation failed' : done ? 'Complete' : 'Generating your kit'}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {Math.round(status.progress)}%
            </span>
          </div>
          <Progress value={status.progress} />
        </div>

        <ol className="relative space-y-0 border-l-2 border-muted pl-0">
          {status.steps.map((step) => {
            const { Icon, className } = stepIcon(step);

            return (
              <li key={step.key} className="relative flex items-start gap-3 py-2.5 pl-6">
                <span className="absolute top-2.5 -left-[13px] flex size-6 items-center justify-center rounded-full bg-background">
                  <Icon className={cn('size-5', className)} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.state === 'pending' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.message ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.message}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {failed && (
        <FailedGenerationState
          message={status.error?.message ?? 'Something went wrong while generating this kit.'}
          isRetrying={retry.isPending}
          onRetry={() =>
            retry.mutate(undefined, {
              onSuccess: () => {
                toast.success('Retry queued. Generation is starting again.');
              },
              onError: (error) => {
                toast.error(getErrorMessage(error));
              },
            })
          }
        />
      )}
    </div>
  );
};

// Pure failed-state UI: the safe backend message plus retry/back actions.
// Kept separate from the mutation wiring so every visual state is testable
// without a query client.
export type FailedGenerationStateProps = {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
};

export const FailedGenerationState: FC<FailedGenerationStateProps> = ({
  message,
  isRetrying,
  onRetry,
}) => (
  <section
    className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-6"
    role="alert"
  >
    <div className="flex items-start gap-3">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div>
        <h2 className="font-semibold">Generation failed</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="size-4" aria-hidden="true" />
        )}
        {isRetrying ? 'Retrying...' : 'Retry generation'}
      </Button>
      <Button asChild variant="outline">
        <Link href={APP_ROUTES.dashboard}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to interview kits
        </Link>
      </Button>
    </div>
  </section>
);

export default GenerationProgress;
