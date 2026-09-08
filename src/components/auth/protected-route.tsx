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

type ProtectedRouteProps = Readonly<{
  children: ReactNode;
}>;

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.status);
  const currentUser = useCurrentUser();
  const unauthorized =
    currentUser.error instanceof ApiClientError && currentUser.error.statusCode === 401;

  useEffect(() => {
    if (authStatus === 'unauthenticated' || unauthorized) {
      router.replace(APP_ROUTES.login);
    }
  }, [authStatus, router, unauthorized]);

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

  if (unauthorized || authStatus === 'unauthenticated') {
    return null;
  }

  return children;
};

export default ProtectedRoute;
