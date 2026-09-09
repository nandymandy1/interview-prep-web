import type { EffectCallback, ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUserResult } from '@/types/auth/auth.type';

const { replace, useCurrentUserMock } = vi.hoisted(() => ({
  replace: vi.fn(),
  useCurrentUserMock: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useEffect: (effect: EffectCallback) => {
      effect();
    },
  };
});

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();

  return { ...actual, useRouter: () => ({ replace, push: vi.fn() }) };
});

vi.mock('@/hooks/auth/use-auth', () => ({
  useCurrentUser: useCurrentUserMock,
}));

const { createElement } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { default: AuthLayout } = await import('@/app/(auth)/layout');
const { default: HomePage } = await import('@/app/page');
const { default: AuthShell } = await import('@/components/auth/auth-shell');
const { default: GuestRoute } = await import('@/components/auth/guest-route');
const { default: ProtectedRoute } = await import('@/components/auth/protected-route');

const user = {
  id: 'user-1',
  email: 'guard@test.dev',
  createdAt: '2026-09-09T00:00:00.000Z',
  updatedAt: '2026-09-09T00:00:00.000Z',
};

const pendingQuery = () => ({
  data: undefined,
  error: null,
  isPending: true,
  isError: false,
  refetch: vi.fn(),
});

const authenticatedQuery = () => ({
  data: { user } as CurrentUserResult,
  error: null,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
});

const missingUserQuery = () => ({
  data: undefined,
  error: new Error('Session lookup failed'),
  isPending: false,
  isError: true,
  refetch: vi.fn(),
});

const rendered = (element: ReactNode): string =>
  renderToStaticMarkup(createElement('div', null, element));

beforeEach(() => {
  replace.mockReset();
  useCurrentUserMock.mockReset();
});

describe('root page', () => {
  it('redirects to /login', () => {
    let digest = '';

    try {
      HomePage({});
    } catch (error) {
      digest = (error as Error & { digest?: string }).digest ?? String(error);
    }

    expect(digest).toContain('/login');
  });
});

describe('ProtectedRoute', () => {
  it('redirects when the session lookup returns no user', () => {
    useCurrentUserMock.mockReturnValue(missingUserQuery());

    expect(rendered(createElement(ProtectedRoute, null, 'secret'))).toBe('<div></div>');
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('renders children for an authenticated session', () => {
    useCurrentUserMock.mockReturnValue(authenticatedQuery());

    expect(rendered(createElement(ProtectedRoute, null, 'secret'))).toContain('secret');
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows loading while the session is unresolved', () => {
    useCurrentUserMock.mockReturnValue(pendingQuery());

    expect(rendered(createElement(ProtectedRoute, null, 'secret'))).not.toContain('secret');
    expect(replace).not.toHaveBeenCalled();
  });
});

describe('GuestRoute', () => {
  it('renders children when the session lookup returns no user', () => {
    useCurrentUserMock.mockReturnValue(missingUserQuery());

    expect(rendered(createElement(GuestRoute, null, 'auth form'))).toContain('auth form');
    expect(replace).not.toHaveBeenCalled();
  });

  it('renders nothing for an authenticated session (effect replaces with /dashboard)', () => {
    useCurrentUserMock.mockReturnValue(authenticatedQuery());

    expect(rendered(createElement(GuestRoute, null, 'auth form'))).toBe('<div></div>');
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows loading while the session is unresolved', () => {
    useCurrentUserMock.mockReturnValue(pendingQuery());

    expect(rendered(createElement(GuestRoute, null, 'auth form'))).not.toContain('auth form');
  });
});

describe('auth layout', () => {
  it('wraps children with GuestRoute', () => {
    const element = AuthLayout({ children: createElement('div', null, 'login') }) as ReactElement<{
      children: ReactElement;
    }>;

    expect(element.type).toBe(GuestRoute);
    expect(element.props.children.type).toBe(AuthShell);
  });
});
