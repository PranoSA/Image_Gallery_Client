"use strict";
/**
 *
 * Takes the images in order
 *
 * Then when you left / right goes to the next image
 *
 * Changes selected image location
 *
 * Changes  selected_date if the Date changes
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
var react_1 = require("react");
var TripContext_1 = require("@/components/TripContext");
var fa_1 = require("react-icons/fa");
var image_1 = require("next/image");
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var ImagePreview = function () {
    var _a = Trip_View_Image_Store_1.useTripViewStore(), viewed_image_index = _a.viewed_image_index, get_images_for_day = _a.get_images_for_day, selected_date = _a.selected_date;
    var selected_trip_id = react_1.useContext(TripContext_1["default"]).id;
    var _b = Trip_View_Image_Store_1.useQueryTrip(selected_trip_id), trip = _b.data, tripLoading = _b.isLoading, tripError = _b.error;
    var _c = Trip_View_Image_Store_1.useQueryTripImages(selected_trip_id), images = _c.data, imagesLoading = _c.isLoading, imagesError = _c.error;
    var clearPreviewImage = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { viewed_image_index: null });
        });
    };
    var setPreviewImage = function (index) {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { viewed_image_index: index });
        });
    };
    var imagesForDay = get_images_for_day(selected_date, (trip === null || trip === void 0 ? void 0 : trip.start_date) || '1970-01-01', images || []);
    if (imagesLoading || tripLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (viewed_image_index === null) {
        return null;
    }
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" },
        React.createElement("div", { className: "relative w-full h-full flex items-center justify-center" },
            React.createElement("span", { className: "absolute top-4 right-4 text-white text-3xl cursor-pointer", onClick: clearPreviewImage }, "\u00D7"),
            React.createElement("button", { className: "absolute left-4 text-white text-3xl cursor-pointer", onClick: function () { return setPreviewImage(viewed_image_index - 1); }, disabled: viewed_image_index === 0 },
                React.createElement(fa_1.FaChevronLeft, null)),
            React.createElement(image_1["default"], { src: process.env.NEXT_PUBLIC_STATIC_IMAGE_URL + "/" + imagesForDay[viewed_image_index].file_path, alt: "Image for " + imagesForDay[viewed_image_index].created_at, width: 500, height: 500 }),
            React.createElement("button", { className: "absolute right-4 text-white text-3xl cursor-pointer", onClick: function () { return setPreviewImage(viewed_image_index + 1); }, disabled: viewed_image_index === imagesForDay.length - 1 },
                React.createElement(fa_1.FaChevronRight, null)))));
};
exports["default"] = ImagePreview;
