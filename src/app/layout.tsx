import type { FC, ReactNode } from 'react';
import type { Metadata } from 'next';
import '@/app/globals.css';
import AppProvider from '@/providers/app.provider';
import { APP_NAME } from '@/constants';

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Personalized company-aware interview preparation kits.',
};

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
