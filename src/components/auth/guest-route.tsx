'use client';

import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useEffect } from 'react';
import LoadingState from '@/components/common/loading-state';
import { APP_ROUTES } from '@/constants';
import { useCurrentUser } from '@/hooks/auth/use-auth';

type GuestRouteProps = Readonly<{
  children: ReactNode;
}>;

// Guest-only guard for /login and /register: an authenticated session bounces
// to the dashboard, while a missing session renders the auth form. GET /api/auth/me stays
// authoritative because HTTP-only session cookies survive a page refresh.
const GuestRoute: FC<GuestRouteProps> = ({ children }) => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const authenticated = currentUser.data?.user !== undefined;

  useEffect(() => {
    if (authenticated) {
      router.replace(APP_ROUTES.dashboard);
    }
  }, [authenticated, router]);

  if (currentUser.isPending) {
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
