import type { LucideIcon } from 'lucide-react';
import type { FC, ReactNode } from 'react';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="rounded-xl border border-dashed px-6 py-12 text-center">
    {Icon ? (
      <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
    ) : null}
    <h2 className="font-medium">{title}</h2>
    <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{description}</p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);

export default EmptyState;
