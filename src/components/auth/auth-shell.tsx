import type { FC, ReactNode } from 'react';
import { APP_NAME } from '@/constants';

type AuthShellProps = Readonly<{
  children: ReactNode;
}>;

const AuthShell: FC<AuthShellProps> = ({ children }) => (
  <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
        <p className="mt-1 text-sm text-muted-foreground">Company-aware interview preparation</p>
      </div>
      {children}
    </div>
  </main>
);

export default AuthShell;
