import type { FC } from 'react';
import { TriangleAlert } from 'lucide-react';
import Button from '@/components/ui/button';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

const ErrorState: FC<ErrorStateProps> = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="rounded-xl border border-dashed p-8 text-center" role="alert">
    <TriangleAlert className="mx-auto mb-3 size-5 text-muted-foreground" aria-hidden="true" />
    <h2 className="font-medium">{title}</h2>
    <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">{message}</p>
    {onRetry ? (
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);

export default ErrorState;
