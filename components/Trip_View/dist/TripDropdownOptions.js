"use strict";
/**
 *
 * This component will have things like
 *
 * 1. Open Form For Comparin Photos
 * 2. Open Form for Setting Dates on Undated Photos
 * 3. Open Form for Adding Photos
 * 4. Open Form For Adding Paths
 * 5. Open Page to View All Paths
 * 3. Open Form for setting geolocation on photos without geolocation
 * 3. Checkbox to Showing Map
 * 4. Checkbox for showing paths
 * 5. Checkbox for "Zoom On Day Change"
 * 6. Checkbox for Image Heat Map
 * 7. Checkbox For Show Day By Day Banners
 *
 *
 */
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
exports.__esModule = true;
exports.TripDropdownMenu = void 0;
var react_1 = require("react");
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var TripContext_1 = require("../TripContext");
var fa_1 = require("react-icons/fa");
exports.TripDropdownMenu = function () {
    var _a = react_1.useState(false), menu = _a[0], setMenu = _a[1];
    var id = react_1.useContext(TripContext_1["default"]).id;
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, tripLoading = _b.isLoading, tripError = _b.error;
    var toggleMenu = function () {
        setMenu(!menu);
    };
    var _c = Trip_View_Image_Store_1.useTripViewStore(), map_open = _c.map_open, day_by_day_banners = _c.day_by_day_banners, paths_open = _c.paths_open, zoom_on_day_change = _c.zoom_on_day_change, image_heat_map = _c.image_heat_map, comparing_photos = _c.comparing_photos, filtering_images = _c.filtering_images;
    //maybe comparing photos should be a new page?
    // for now , just have it on the same page
    //
    return (react_1["default"].createElement("div", { className: "relative inline-block text-left" },
        react_1["default"].createElement("button", { onClick: toggleMenu, className: "inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none" },
            menu ? 'Close Menu' : 'Open Menu',
            menu ? (react_1["default"].createElement(fa_1.FaChevronUp, { className: "ml-2" })) : (react_1["default"].createElement(fa_1.FaChevronDown, { className: "ml-2" }))),
        menu && (react_1["default"].createElement("div", { className: "z-50 origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" },
            react_1["default"].createElement("div", { className: "py-1", role: "menu", "aria-orientation": "vertical", "aria-labelledby": "options-menu" },
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: comparing_photos, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { comparing_photos: !state.comparing_photos });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, comparing_photos ? 'Stop Comparing Photos' : 'Compare Photos')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: paths_open, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { paths_open: !state.paths_open });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Show Paths')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: map_open, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { map_open: !state.map_open });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Show Map')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: day_by_day_banners, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { day_by_day_banners: !state.day_by_day_banners });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Show Day By Day Banners')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: zoom_on_day_change, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { zoom_on_day_change: !state.zoom_on_day_change });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Zoom On Day Change')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: filtering_images, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { filtering_images: !state.filtering_images });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Display Category Legend')),
                react_1["default"].createElement("label", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: image_heat_map, onChange: function () {
                            return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                                return __assign(__assign({}, state), { image_heat_map: !state.image_heat_map });
                            });
                        }, className: "form-checkbox h-5 w-5 text-gray-600" }),
                    react_1["default"].createElement("span", { className: "text-gray-700 text-sm" }, 'Enable Image Heat Map')),
                react_1["default"].createElement("button", { className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left", onClick: function () {
                        return Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                            return __assign(__assign({}, state), { adding_path: !state.adding_path });
                        });
                    } }, 'Add Path'))))));
};
