import type { FC, ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

const EmptyState: FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="rounded-xl border border-dashed px-6 py-12 text-center">
    <h2 className="font-medium">{title}</h2>
    <p className="text-muted-foreground mx-auto mt-1 max-w-lg text-sm">{description}</p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);

export default EmptyState;
