'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const queryClient = new QueryClient();
const inter = Inter({ subsets: ['latin'] });

/*
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </QueryClientProvider>
  );
}*/

// NO ---- NO ---- NO ---- I DO NOT WANT QUERYCLIENTPROVIDER IN THE LAYOUT
const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
