import Link from 'next/link';
import type { FC } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import KitStatusBadge from '@/components/kits/kit-status-badge';
import { APP_ROUTES } from '@/constants';
import type { KitSummary } from '@/types/kits/kit.type';

type KitListProps = {
  kits: KitSummary[];
};

const KitList: FC<KitListProps> = ({ kits }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {kits.map((kit) => (
      <Link
        key={kit.id}
        href={APP_ROUTES.kit(kit.id)}
        className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Card className="h-full py-5 transition-colors transition-shadow group-hover:border-muted-foreground/30 group-hover:shadow-md">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="size-5 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{kit.role || 'Interview preparation'}</h2>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {kit.company || 'Company research pending'}
                  </p>
                </div>
              </div>
              <KitStatusBadge status={kit.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Updated {new Date(kit.updatedAt).toLocaleString()}
              </p>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    ))}
  </div>
);

export default KitList;
