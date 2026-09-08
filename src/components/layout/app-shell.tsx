'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC, ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import Button from '@/components/ui/button';
import { APP_NAME, APP_ROUTES } from '@/constants';
import { useLogout } from '@/hooks/auth/use-auth';
import { getErrorMessage } from '@/lib/error';
import { useAuthStore } from '@/stores/auth/auth.store';
import { toast } from 'sonner';

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

const AppShell: FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout.mutateAsync();
      router.replace(APP_ROUTES.login);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={APP_ROUTES.dashboard} className="font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-muted-foreground hidden text-sm sm:inline">{user.email}</span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={handleLogout} disabled={logout.isPending}>
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default AppShell;
