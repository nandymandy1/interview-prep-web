import Link from 'next/link';
import type { FC } from 'react';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
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
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{kit.role || 'Interview preparation'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {kit.company || 'Company research pending'}
                </p>
              </div>
              <Badge variant={kit.status === 'completed' ? 'default' : 'secondary'}>
                {kit.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(kit.updatedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </Link>
    ))}
  </div>
);

export default KitList;
