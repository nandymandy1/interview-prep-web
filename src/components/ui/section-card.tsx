import type { LucideIcon } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import CardHeader from '@/components/ui/card-header';
import CardTitle from '@/components/ui/card-title';
import { cn } from '@/lib/utils';

type SectionCardProps = Readonly<{
  id?: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}>;

// One visual pattern for every kit detail section: icon + title, optional
// description/count/actions, then content. Anchored via id for the section nav.
const SectionCard: FC<SectionCardProps> = ({
  id,
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}) => (
  <section id={id} aria-label={title} className="scroll-mt-20">
    <Card className={cn('gap-0', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="space-y-0.5">
            <CardTitle>{title}</CardTitle>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </section>
);

export default SectionCard;
