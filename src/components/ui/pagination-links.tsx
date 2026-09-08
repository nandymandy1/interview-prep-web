'use client';

import Link from 'next/link';
import type { FC } from 'react';
import { getPageWindow } from '@/lib/pagination';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/pagination.type';

type PaginationLinksProps = {
  pagination: PaginationMeta;
  getPageHref: (page: number) => string;
};

const linkClassName =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

const PaginationLinks: FC<PaginationLinksProps> = ({ pagination, getPageHref }) => {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {pagination.hasPrevPage && pagination.prevPage !== null ? (
        <Link
          href={getPageHref(pagination.prevPage)}
          aria-label="Previous page"
          className={cn(linkClassName)}
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(linkClassName, 'pointer-events-none opacity-50')}>
          Previous
        </span>
      )}

      {getPageWindow(pagination.page, pagination.totalPages).map((entry, index) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-muted-foreground">
            …
          </span>
        ) : entry === pagination.page ? (
          <span
            key={entry}
            aria-current="page"
            aria-label={`Page ${entry}`}
            className={cn(
              linkClassName,
              'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            )}
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={getPageHref(entry)}
            aria-label={`Page ${entry}`}
            className={cn(linkClassName)}
          >
            {entry}
          </Link>
        ),
      )}

      {pagination.hasNextPage && pagination.nextPage !== null ? (
        <Link
          href={getPageHref(pagination.nextPage)}
          aria-label="Next page"
          className={cn(linkClassName)}
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(linkClassName, 'pointer-events-none opacity-50')}>
          Next
        </span>
      )}
    </nav>
  );
};

export default PaginationLinks;
