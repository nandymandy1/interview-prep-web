'use client';

import Link from 'next/link';
import type { FC } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import EmptyState from '@/components/common/empty-state';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import KitList from '@/components/kits/kit-list';
import { APP_ROUTES } from '@/constants';
import { useKits } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';
import { getKitListErrorMessage } from '@/lib/kit-availability';

const DashboardView: FC = () => {
  const kits = useKits();

  return (
    <PageContainer>
      <PageHeader
        title="Interview kits"
        description="Create a focused plan from a job description, company research, and the time you have available."
        action={
          <Button asChild>
            <Link href={APP_ROUTES.newKit}>
              <Plus className="size-4" aria-hidden="true" />
              New kit
            </Link>
          </Button>
        }
      />

      {kits.isPending && <LoadingState rows={4} />}

      {kits.isError && (
        <ErrorState
          message={getKitListErrorMessage(kits.error) ?? getErrorMessage(kits.error)}
          onRetry={() => kits.refetch()}
        />
      )}

      {kits.data?.length === 0 ? (
        <EmptyState
          title="No interview kits yet"
          description="Paste a job description and company URL to create your first preparation kit."
          action={
            <Button asChild>
              <Link href={APP_ROUTES.newKit}>Create first kit</Link>
            </Button>
          }
        />
      ) : null}

      {kits.data && kits.data.length > 0 ? <KitList kits={kits.data} /> : null}
    </PageContainer>
  );
};

export default DashboardView;
