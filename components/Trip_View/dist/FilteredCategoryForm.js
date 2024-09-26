"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var TripContext_1 = require("../TripContext");
var react_1 = require("react");
var fa_1 = require("react-icons/fa");
//close icon
var fa_2 = require("react-icons/fa");
var FilteredCategoryForm = function () {
    var id = react_1.useContext(TripContext_1["default"]).id;
    var _a = Trip_View_Image_Store_1.useQueryTrip(id), trip = _a.data, tripLoading = _a.isLoading, tripError = _a.error;
    var categories = (trip === null || trip === void 0 ? void 0 : trip.categories) || [];
    var filtered_categories = Trip_View_Image_Store_1.useTripViewStore().filtered_categories;
    var handleCheckboxChange = function (name) {
        //if the category is in filtered_categories, remove it
        if (filtered_categories.includes(name)) {
            Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                return __assign(__assign({}, state), { filtered_categories: state.filtered_categories.filter(function (category) { return category !== name; }) });
            });
        }
        else {
            Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                return __assign(__assign({}, state), { filtered_categories: __spreadArrays(state.filtered_categories, [name]) });
            });
        }
    };
    var handleClose = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { filtering_categories: false, selecting_category: false });
        });
    };
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { className: "fixed inset-0 bg-black opacity-50" }),
        React.createElement("div", { id: "category-modal", className: "relative max-w-md mx-auto p-4 bg-white shadow-md rounded-lg z-10" },
            React.createElement("button", { className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700", onClick: handleClose },
                React.createElement(fa_2.FaTimes, { className: "text-2xl", size: 24 })),
            React.createElement("h2", { className: "text-xl font-bold mb-4" }, "Select Categories"),
            React.createElement("ul", null, categories.map(function (category) { return (React.createElement("li", { key: category.category, className: "flex items-center mb-2" },
                React.createElement(fa_1.FaFolder, { className: "mr-2 text-gray-500" }),
                React.createElement("input", { type: "checkbox", checked: !filtered_categories.includes(category.category), onChange: function () { return handleCheckboxChange(category.category); }, className: "mr-2" }),
                React.createElement("span", null, category.category))); })))));
};
exports["default"] = FilteredCategoryForm;
