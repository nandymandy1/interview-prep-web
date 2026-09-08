'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { FC } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import EmptyState from '@/components/common/empty-state';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import PaginationLinks from '@/components/ui/pagination-links';
import KitList from '@/components/kits/kit-list';
import { APP_ROUTES } from '@/constants';
import { useKits } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';
import { buildPaginationHref, parsePaginationParams } from '@/lib/pagination';

const DashboardView: FC = () => {
  const searchParams = useSearchParams();
  const { page, limit } = parsePaginationParams({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  const kits = useKits({ page, limit });
  const pagination = kits.data?.pagination;
  const items = kits.data?.items ?? [];
  const outOfRange = items.length === 0 && (pagination?.totalItems ?? 0) > 0;

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
        <ErrorState message={getErrorMessage(kits.error)} onRetry={() => kits.refetch()} />
      )}

      {pagination?.totalItems === 0 ? (
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

      {outOfRange ? (
        <EmptyState
          title={`Page ${page} is empty`}
          description="This page has no kits. New kits may have shifted the pages."
          action={
            <Button asChild>
              <Link
                href={buildPaginationHref({
                  pathname: APP_ROUTES.dashboard,
                  searchParams,
                  page: 1,
                  limit,
                })}
              >
                Back to page 1
              </Link>
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? <KitList kits={items} /> : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-6">
          <PaginationLinks
            pagination={pagination}
            getPageHref={(nextPage) =>
              buildPaginationHref({
                pathname: APP_ROUTES.dashboard,
                searchParams,
                page: nextPage,
                limit,
              })
            }
          />
        </div>
      ) : null}
    </PageContainer>
  );
};

export default DashboardView;
