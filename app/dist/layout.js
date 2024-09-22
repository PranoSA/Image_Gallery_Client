'use client';
"use strict";
exports.__esModule = true;
var react_query_1 = require("@tanstack/react-query");
var google_1 = require("next/font/google");
require("./globals.css");
var queryClient = new react_query_1.QueryClient();
var inter = google_1.Inter({ subsets: ['latin'] });
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
var RootLayout = function (_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "en" },
        React.createElement("body", { className: inter.className }, children)));
};
exports["default"] = RootLayout;
