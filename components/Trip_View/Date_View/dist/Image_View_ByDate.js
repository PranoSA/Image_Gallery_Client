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
var EditImageForm_1 = require("@/components/Trip_View/EditImageForm");
var ImagePreview_1 = require("@/components/Trip_View/ImagePreview");
var TripContext_1 = require("@/components/TripContext");
var Time_Functions_1 = require("@/components/Trip_View/Time_Functions");
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
    var selectedDate = react_1.useMemo(function () {
        //const start_date = new Date(trip?.start_date || '1970-01-01');
        var start_date = Time_Functions_1.dateFromString((trip === null || trip === void 0 ? void 0 : trip.start_date) || '1970-01-01');
        //forcibly move the date to UTC - so extrapolate the
        start_date.setDate(start_date.getDate() + selected_date);
        return start_date;
    }, [selected_date, trip]);
    var groupedOrderedImagesByDay = react_1.useMemo(function () {
        var groupImagesByDay = function (images) {
            var grouped = [];
            if (!trip)
                return [];
            if (!images)
                return [];
            //here is what we want to do -----
            // get the selected date
            // add 24 hours to the selected date
            //for each image, transform the created_at to a time using the timeFromString function
            // that I built
            // return images that are between the selected date and the selected date + 24 hours
            var selectedDate = Time_Functions_1.dateFromString(trip.start_date);
            selectedDate.setDate(selectedDate.getDate() + selected_date);
            var selectedDateEnd = new Date(selectedDate);
            selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);
            //now  use get images for day to get the images for the selected date
            var imagesForSelectedDate = get_images_for_day(selected_date, trip.start_date, images);
            console.log('images for child component from parent', imagesForSelectedDate);
            return [
                {
                    date: selectedDate,
                    images: imagesForSelectedDate
                },
            ];
        };
        return groupImagesByDay(images);
    }, [images, trip, selected_date, selectedDate]);
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
        React.createElement("div", { className: "gallery mt-4" }),
        React.createElement("div", { className: "scrollable-container overflow-y-auto h-96 p-4 bg-white rounded-b-lg shadow-lg border border-gray-300" },
            React.createElement(GroupImagesByTime, { images: groupedOrderedImagesByDay[0].images, date: groupedOrderedImagesByDay[0].date })),
        React.createElement(ImagePreview_1["default"], null)));
};
var GroupImagesByTime = function (_a) {
    var images = _a.images, date = _a.date;
    // group images into SubRangeOfImages
    var selected_image_location = Trip_View_Image_Store_1.useTripViewStore().selected_image_location;
    console.log('images child component', images);
    var groupedSubRangeImages = function (images, date) {
        var current_hour = 0;
        //make start_hour to be the hour of the first image
        if (images.length > 0) {
            current_hour = new Date(
            //getDateAtLocalTime(images[0].created_at)
            Time_Functions_1.timeFromString(images[0].created_at)).getHours();
            //subtract offset
        }
        //let start_hour = 0;
        var start_hour = current_hour;
        var list_of_subranges = [];
        while (current_hour < 24) {
            // incriment through hours until adding the next hour would exceed 6 images
            var current_subrange = {
                start_hour: current_hour,
                end_hour: 0,
                images: []
            };
            var images_for_hour = images.filter(function (image) {
                return Time_Functions_1.timeFromString(image.created_at).getHours() === current_hour;
            });
            //append list of images to current_subrange
            current_subrange.images = current_subrange.images.concat(images_for_hour);
            current_hour += 1;
            var images_for_next_hour = images.filter(function (image) {
                Time_Functions_1.timeFromString(image.created_at).getHours() === current_hour;
            });
            var number_of_images = images_for_hour.length;
            while (number_of_images + images_for_next_hour.length <= 6) {
                current_hour++;
                //append list of images to current_subrange
                current_subrange.images =
                    current_subrange.images.concat(images_for_next_hour);
                number_of_images += images_for_next_hour.length;
                images_for_next_hour = images.filter(function (image) {
                    var passes_filter = Time_Functions_1.timeFromString(image.created_at).getHours() === current_hour;
                    return passes_filter;
                });
                //maximum duration of 3 hours
                if (current_hour - start_hour >= 4) {
                    break;
                }
                //break if next hour is 24
                if (current_hour === 24) {
                    break;
                }
            }
            //if the number of images is 0, then don't add it and go to next iteration
            if (current_subrange.images.length === 0) {
                continue;
            }
            //set end hour as the max of current_hour and the hour of the last image i nth esubrange
            var max_hour = current_subrange.images.length > 0
                ? Math.max(current_hour, new Date(
                //getDateAtLocalTime(current_subrange.images[current_subrange.images.length - 1].created_at)
                Time_Functions_1.timeFromString(current_subrange.images[current_subrange.images.length - 1]
                    .created_at)).getHours())
                : current_hour;
            current_subrange.end_hour = max_hour;
            list_of_subranges.push(current_subrange);
            ///return list_of_subranges;
        }
        console.log('list of subranges', list_of_subranges);
        return list_of_subranges;
    };
    //use memo to create the list of subranges
    var subranges = react_1.useMemo(function () {
        return groupedSubRangeImages(images, date);
    }, [images, date]);
    //use store to set the selected image preview and editing image
    var store = Trip_View_Image_Store_1.tripViewStore;
    var setSelectedImagePreview = function (image) {
        store.setState(function (state) {
            return __assign(__assign({}, state), { selected_image_preview: image });
        });
    };
    //set editing image
    var setEditingImage = function (image) {
        store.setState(function (state) {
            return __assign(__assign({}, state), { editingImage: image });
        });
    };
    // set the selected image location
    var setSelectedImageLocation = function (image) {
        store.setState(function (state) {
            return __assign(__assign({}, state), { selected_image_location: image });
        });
    };
    var setPreviewImage = function (index) {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { viewed_image_index: index });
        });
    };
    //return gallery based on subranges
    return (React.createElement("div", { className: "p-4" },
        React.createElement("div", { className: "text-2xl font-bold mb-4" }, date.toDateString()),
        subranges.map(function (subrange) {
            var startHour = new Date(subrange.start_hour).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            var endHour = new Date(subrange.end_hour).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            return (React.createElement("div", { key: date.toDateString() + subrange.start_hour, className: "mb-8" },
                React.createElement("div", { className: "text-lg font-semibold mb-2" },
                    subrange.start_hour > 12
                        ? subrange.start_hour - 12 + "PM"
                        : subrange.start_hour + "AM",
                    ' ',
                    "-",
                    ' ',
                    subrange.end_hour - 12
                        ? subrange.end_hour - 12 + "PM"
                        : subrange.end_hour + "AM"),
                React.createElement("div", { className: "flex flex-wrap flex-row justify-around mt-4 items-center gap-y-4" }, subrange.images.map(function (image, i) {
                    return (React.createElement("div", { key: image.id, className: "relative flex flex-col items-center w-1/6" },
                        React.createElement("div", { key: image.id, className: "relative w-full flex m-4 flex-col items-center p-4 bg-white rounded-lg shadow-lg border border-gray-300" },
                            React.createElement("div", { onClick: function () { return setSelectedImageLocation(image); }, className: "w-32 h-[128px] flex items-center justify-center bg-gray-100 p-5 border border-gray-700" },
                                React.createElement(image_1["default"], { src: process.env.NEXT_PUBLIC_STATIC_IMAGE_URL + "/" + image.file_path, alt: "Image for " + image.created_at, width: 128, height: 128, className: "object-contain rounded-lg shadow-md", style: {
                                        cursor: 'pointer',
                                        margin: '10px',
                                        border: selected_image_location &&
                                            selected_image_location.id === image.id
                                            ? '5px solid blue'
                                            : 'none'
                                    } })),
                            React.createElement("div", { className: "absolute top-1 right-1 flex " },
                                React.createElement(hi_1.HiOutlinePencil, { onClick: function () { return setEditingImage(image); }, className: "cursor-pointer", size: 24, style: { marginRight: '10px' } }),
                                React.createElement(hi_1.HiEye, { onClick: function () { return setPreviewImage(i); }, className: "cursor-pointer", size: 24 })),
                            React.createElement("div", { className: "mt-2 text-center text-sm font-medium text-gray-700" }, image.name))));
                })),
                React.createElement(EditImageForm_1["default"], null)));
        })));
};
exports["default"] = Image_View_ByDate;
