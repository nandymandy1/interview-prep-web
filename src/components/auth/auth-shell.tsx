import type { FC, ReactNode } from 'react';
import { APP_NAME } from '@/constants';

type AuthShellProps = Readonly<{
  children: ReactNode;
}>;

const AuthShell: FC<AuthShellProps> = ({ children }) => (
  <main className="bg-muted/30 flex min-h-svh items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold tracking-tight">{APP_NAME}</p>
        <p className="text-muted-foreground mt-1 text-sm">Company-aware interview preparation</p>
      </div>
      {children}
    </div>
  </main>
);

export default AuthShell;
