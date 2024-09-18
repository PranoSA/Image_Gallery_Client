'use client';
"use strict";
exports.__esModule = true;
var react_query_1 = require("@tanstack/react-query");
var google_1 = require("next/font/google");
require("./globals.css");
var queryClient = new react_query_1.QueryClient();
var inter = google_1.Inter({ subsets: ['latin'] });
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement(react_query_1.QueryClientProvider, { client: queryClient },
        React.createElement("html", { lang: "en" },
            React.createElement("body", { className: inter.className }, children))));
}
exports["default"] = RootLayout;
