import { QueryClient } from '@tanstack/react-query';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PaginationLinks from '@/components/ui/pagination-links';
import { QUERY_KEYS } from '@/constants';
import type { PaginationMeta } from '@/types/pagination.type';
import { buildPaginationHref, getPageWindow, parsePaginationParams } from '@/lib/pagination';

describe('pagination URL params', () => {
  it('parses valid page and limit', () => {
    expect(parsePaginationParams({ page: '2', limit: '10' })).toEqual({ page: 2, limit: 10 });
  });

  it('falls back to defaults for missing or invalid values', () => {
    expect(parsePaginationParams({})).toEqual({ page: 1, limit: 20 });
    expect(parsePaginationParams({ page: 'abc', limit: 'hello' })).toEqual({
      page: 1,
      limit: 20,
    });
    expect(parsePaginationParams({ page: '0', limit: '0' })).toEqual({ page: 1, limit: 20 });
    expect(parsePaginationParams({ page: '-2', limit: '500' })).toEqual({ page: 1, limit: 20 });
    expect(parsePaginationParams({ page: '1.5', limit: '2.5' })).toEqual({ page: 1, limit: 20 });
  });
});

describe('page window', () => {
  it('returns no entries without pages', () => {
    expect(getPageWindow(1, 0)).toEqual([]);
  });

  it('returns the single page', () => {
    expect(getPageWindow(1, 1)).toEqual([1]);
  });

  it('shows every page for small counts', () => {
    expect(getPageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it('bounds the start window with an ellipsis', () => {
    expect(getPageWindow(1, 20)).toEqual([1, 2, 3, 'ellipsis', 20]);
  });

  it('centers the window with ellipses on both sides', () => {
    expect(getPageWindow(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('bounds the end window with an ellipsis', () => {
    expect(getPageWindow(20, 20)).toEqual([1, 'ellipsis', 18, 19, 20]);
  });
});

describe('pagination hrefs', () => {
  it('sets page and limit while preserving unrelated params', () => {
    expect(
      buildPaginationHref({
        pathname: '/dashboard',
        searchParams: 'status=ready&page=2&limit=20',
        page: 3,
        limit: 20,
      }),
    ).toBe('/dashboard?status=ready&page=3&limit=20');
  });

  it('adds page and limit when absent', () => {
    expect(
      buildPaginationHref({ pathname: '/dashboard', searchParams: '', page: 1, limit: 20 }),
    ).toBe('/dashboard?page=1&limit=20');
  });
});

describe('pagination links', () => {
  const meta = (page: number, totalPages: number): PaginationMeta => ({
    page,
    limit: 20,
    totalItems: totalPages * 20,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  });
  const href = (page: number): string => `/dashboard?page=${page}&limit=20`;
  const render = (page: number, totalPages: number): string =>
    renderToStaticMarkup(
      createElement(PaginationLinks, { pagination: meta(page, totalPages), getPageHref: href }),
    );

  it('renders nothing without multiple pages', () => {
    expect(render(1, 0)).toBe('');
    expect(render(1, 1)).toBe('');
  });

  it('marks the current page and disables Previous on page 1', () => {
    const html = render(1, 3);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/dashboard?page=2&amp;limit=20"');
    expect(html).not.toContain('page=0');
  });

  it('disables Next on the last page', () => {
    const html = render(3, 3);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/dashboard?page=2&amp;limit=20"');
    expect(html).not.toContain('page=4');
  });

  it('renders real links with ellipsis for large page counts', () => {
    const html = render(10, 20);
    expect(html).toContain('href="/dashboard?page=1&amp;limit=20"');
    expect(html).toContain('href="/dashboard?page=20&amp;limit=20"');
    expect(html).toContain('aria-label="Pagination"');
  });
});

describe('kits query keys', () => {
  it('caches pages independently', () => {
    const client = new QueryClient();
    client.setQueryData(QUERY_KEYS.kits.list({ page: 1, limit: 20 }), { items: ['a'] });

    expect(client.getQueryData(QUERY_KEYS.kits.list({ page: 1, limit: 20 }))).toEqual({
      items: ['a'],
    });
    expect(client.getQueryData(QUERY_KEYS.kits.list({ page: 2, limit: 20 }))).toBeUndefined();
    expect(QUERY_KEYS.kits.all).toEqual(['kits']);
    expect(QUERY_KEYS.kits.list({ page: 1, limit: 20 })[0]).toBe('kits');
  });
});
