'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import ReactQueryProvider from '@/components/QueryClientProvider';

const inter = Inter({ subsets: ['latin'] });

import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { signOut } from 'next-auth/react';

const NextAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sessionProps: SessionProviderProps = {
    children,
    refetchInterval: 300,
  };

  return <SessionProvider {...sessionProps} />;
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ReactQueryProvider>
            <main>{children}</main>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
