import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { FC, ReactNode } from 'react';

type PageHeaderProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}>;

const PageHeader: FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
}) => (
  <div className="mb-8">
    {backHref ? (
      <Link
        href={backHref}
        className="mb-3 inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel ?? 'Back'}
      </Link>
    ) : null}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  </div>
);

export default PageHeader;
