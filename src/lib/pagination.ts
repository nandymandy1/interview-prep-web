// Pagination helpers mirrored against the backend HTTP contract
// (DEFAULT_PAGE_LIMIT 20, MAX_PAGE_LIMIT 100). The backend stays
// authoritative; these only normalize URL state for rendering/navigation.

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export type PaginationParams = {
  page: number;
  limit: number;
};

const toSafePositiveInt = (value: string | null | undefined, fallback: number): number => {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : fallback;
};

export const parsePaginationParams = (params: {
  page?: string | null;
  limit?: string | null;
}): PaginationParams => {
  const limit = toSafePositiveInt(params.limit, DEFAULT_PAGE_LIMIT);
  return {
    page: toSafePositiveInt(params.page, DEFAULT_PAGE),
    limit: limit <= MAX_PAGE_LIMIT ? limit : DEFAULT_PAGE_LIMIT,
  };
};

export type PageWindowEntry = number | 'ellipsis';

export const getPageWindow = (page: number, totalPages: number): PageWindowEntry[] => {
  if (totalPages <= 0) {
    return [];
  }
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 1) {
    pages.add(Math.min(page + 2, totalPages));
  }
  if (page >= totalPages) {
    pages.add(Math.max(page - 2, 1));
  }
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const window: PageWindowEntry[] = [];
  for (const value of sorted) {
    const previous = window[window.length - 1];
    if (typeof previous === 'number' && value - previous > 1) {
      window.push('ellipsis');
    }
    window.push(value);
  }
  return window;
};

export const buildPaginationHref = (input: {
  pathname: string;
  searchParams: { toString: () => string } | string;
  page: number;
  limit: number;
}): string => {
  const params =
    typeof input.searchParams === 'string'
      ? new URLSearchParams(input.searchParams)
      : new URLSearchParams(input.searchParams.toString());
  params.set('page', String(input.page));
  params.set('limit', String(input.limit));
  const query = params.toString();
  return query ? `${input.pathname}?${query}` : input.pathname;
};
