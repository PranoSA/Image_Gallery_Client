'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import ReactQueryProvider from '@/components/QueryClientProvider';

const inter = Inter({ subsets: ['latin'] });

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <main>{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
