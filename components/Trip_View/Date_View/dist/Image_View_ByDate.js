'use client';
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
exports.__esModule = true;
var hi_1 = require("react-icons/hi");
var image_1 = require("next/image");
var Trip_View_Image_Store_1 = require("@/components/Trip_View/Trip_View_Image_Store");
var react_1 = require("react");
var ImagePreview_1 = require("@/components/Trip_View/ImagePreview");
var TripContext_1 = require("@/components/TripContext");
var Image_View_ByDate = function () {
    var _a = Trip_View_Image_Store_1.useTripViewStore(), selected_date = _a.selected_date, get_images_for_day = _a.get_images_for_day, viewed_image_index = _a.viewed_image_index, selected_image_location = _a.selected_image_location, editingImage = _a.editingImage;
    // mutate
    var selected_trip_id = react_1.useContext(TripContext_1["default"]).id;
    //get trip id from the store
    //get the trip info
    var _b = Trip_View_Image_Store_1.useQueryTrip(selected_trip_id), trip = _b.data, tripLoading = _b.isLoading, tripLoadingError = _b.error;
    //use query to get the images for the trip
    var _c = Trip_View_Image_Store_1.useQueryTripImages(selected_trip_id), images = _c.data, isLoading = _c.isLoading, error = _c.error;
    var _d = react_1.useState(null), editedImage = _d[0], setEditedImage = _d[1];
    //set up mutation for updating the image
    if (error) {
        return React.createElement("div", null,
            "Error: ",
            error.message);
    }
    if (tripLoading) {
        return React.createElement("div", null, "Loading...");
    }
    //if selected_id is null, return loading
    if (!selected_trip_id) {
        return React.createElement("div", null, "Loading...");
    }
    if (tripLoadingError) {
        return React.createElement("div", null, "Error Loading Trip");
    }
    var imagesForDay = get_images_for_day(selected_date, (trip === null || trip === void 0 ? void 0 : trip.start_date) || '1970-01-01', images || []);
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (error) {
        return React.createElement("div", null, "Error Loading Images ");
    }
    if (!images) {
        return React.createElement("div", null, "No images");
    }
    var handleImageClick = function (image) {
        //set the selected image location
        //clear if already selected
        if (selected_image_location && selected_image_location.id === image.id) {
            Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                return __assign(__assign({}, state), { selected_image_location: null });
            });
            return;
        }
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { selected_image_location: image });
        });
    };
    //handle edit image shows the edit image form
    var handleEditImage = function (image) {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { editingImage: image });
        });
        setEditedImage(image);
    };
    var setPreviewImage = function (index) {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { viewed_image_index: index });
        });
    };
    return (React.createElement("div", null,
        React.createElement("div", { className: "gallery mt-4" }, imagesForDay.map(function (image, i) { return (React.createElement("div", { key: image.id },
            React.createElement(image_1["default"], { src: process.env.NEXT_PUBLIC_STATIC_IMAGE_URL + "/" + image.file_path, alt: "Image for " + image.created_at, width: 100, height: 100, onClick: function () { return handleImageClick(image); }, style: {
                    cursor: 'pointer',
                    margin: '10px',
                    width: '100px',
                    height: '100px',
                    border: selected_image_location &&
                        selected_image_location.id === image.id
                        ? '5px solid blue'
                        : 'none'
                } }),
            React.createElement(hi_1.HiOutlinePencil, { onClick: function () { return handleEditImage(image); }, className: "cursor-pointer" }),
            React.createElement(hi_1.HiEye, { onClick: function () { return setPreviewImage(i); }, className: "cursor-pointer" }))); })),
        React.createElement(ImagePreview_1["default"], null)));
};
exports["default"] = Image_View_ByDate;
