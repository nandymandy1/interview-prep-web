'use client';

import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useEffect } from 'react';
import ErrorState from '@/components/common/error-state';
import LoadingState from '@/components/common/loading-state';
import { APP_ROUTES } from '@/constants';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { getErrorMessage } from '@/lib/error';
import { ApiClientError } from '@/services/http/api-client.service';
import { useAuthStore } from '@/stores/auth/auth.store';

type GuestRouteProps = Readonly<{
  children: ReactNode;
}>;

// Guest-only guard for /login and /register: an authenticated session bounces
// to the dashboard, while a 401 renders the auth form. GET /api/auth/me stays
// authoritative (HTTP-only cookies survive refresh while Zustand starts idle).
const GuestRoute: FC<GuestRouteProps> = ({ children }) => {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.status);
  const currentUser = useCurrentUser();
  const unauthorized =
    currentUser.error instanceof ApiClientError && currentUser.error.statusCode === 401;
  const authenticated = currentUser.data?.user !== undefined;

  useEffect(() => {
    if (authenticated) {
      router.replace(APP_ROUTES.dashboard);
    }
  }, [authenticated, router]);

  if (currentUser.isError && !unauthorized) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <ErrorState
          message={getErrorMessage(currentUser.error)}
          onRetry={() => currentUser.refetch()}
        />
      </main>
    );
  }

  if (currentUser.isPending || authStatus === 'idle') {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <LoadingState rows={4} />
      </main>
    );
  }

  if (authenticated) {
    return null;
  }

  return children;
};

export default GuestRoute;
