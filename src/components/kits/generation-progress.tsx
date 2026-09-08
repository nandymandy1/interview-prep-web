import type { FC } from 'react';
import { Check, Circle, CircleAlert, LoaderCircle } from 'lucide-react';
import Progress from '@/components/ui/progress';
import type { KitStatusResult } from '@/types/kits/kit.type';

type GenerationProgressProps = {
  status: KitStatusResult;
};

const GenerationProgress: FC<GenerationProgressProps> = ({ status }) => (
  <section className="space-y-5 rounded-xl border p-6" aria-live="polite">
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="font-semibold">Generating your kit</h2>
        <span className="text-sm text-muted-foreground">{Math.round(status.progress)}%</span>
      </div>
      <Progress value={status.progress} />
    </div>

    <ol className="space-y-3">
      {status.steps.map((step) => {
        const Icon =
          step.state === 'completed'
            ? Check
            : step.state === 'failed'
              ? CircleAlert
              : step.state === 'running'
                ? LoaderCircle
                : Circle;

        return (
          <li key={step.key} className="flex items-start gap-3 text-sm">
            <Icon
              className={step.state === 'running' ? 'mt-0.5 size-4 animate-spin' : 'mt-0.5 size-4'}
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">{step.label}</p>
              {step.message ? <p className="text-muted-foreground">{step.message}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);

export default GenerationProgress;
