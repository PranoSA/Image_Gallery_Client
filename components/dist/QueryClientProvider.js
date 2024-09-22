'use client';
"use strict";
exports.__esModule = true;
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
var react_2 = require("react");
var ReactQueryProvider = function (_a) {
    var children = _a.children;
    var queryClient = react_2.useState(function () { return new react_query_1.QueryClient(); })[0];
    return (react_1["default"].createElement(react_query_1.QueryClientProvider, { client: queryClient }, children));
};
exports["default"] = ReactQueryProvider;
