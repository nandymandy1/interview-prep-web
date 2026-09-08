import type { FC, ReactNode } from 'react';

type PageHeaderProps = Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
}>;

const PageHeader: FC<PageHeaderProps> = ({ title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default PageHeader;
