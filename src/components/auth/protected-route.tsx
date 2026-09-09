'use client';

import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useEffect } from 'react';
import LoadingState from '@/components/common/loading-state';
import { APP_ROUTES } from '@/constants';
import { useCurrentUser } from '@/hooks/auth/use-auth';

type ProtectedRouteProps = Readonly<{
  children: ReactNode;
}>;

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const authenticated = currentUser.data?.user !== undefined;

  useEffect(() => {
    if (!currentUser.isPending && !authenticated) {
      router.replace(APP_ROUTES.login);
    }
  }, [authenticated, currentUser.isPending, router]);

  if (currentUser.isPending) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <LoadingState rows={4} />
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
