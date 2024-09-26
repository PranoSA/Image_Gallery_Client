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
/**
 *
 *
 * This component is responsible for displaying the images of the trip.
 *
 * But in a timed order
 *
 * The way to do this is sort images by created_at
 * Then between each day - write the day
 *
 * Also, if more than 6 images in a day, then write an hour time-range that encapsulates the images
 *
 * Make the widget scrollable
 *
 * The time ranges should encapsulate 6 images - but can encapsulate more or less depending on
 *
 * Here is the algorithm, split on the hours according to the largest hour that encapsulates 6 images
 *
 * 1. Needs to be in hour increments, so if 4pm-5pm entailed more than 6 photos, then 4pm to 5pm is fine
 * 2. If 4pm - 6pm has 9 photos, then split them up into 4pm-5pm and 5pm-6pm
 * 3. If 4pm - 6pm has 5 photos, and 4pm -7pm has 6 photos, then it should be 4pm-7pm
 * 4. if 4pm-7pm has 5 photos and 4pm-8pm has 7 photos, should be 4pm-7pm and then apply the logic starting at7pm
 *
 *
 * Also when you click an image - it should selected the selected_image_location in the store
 * When you click the "eye" icon, it should set the selected_image_preview in the store
 * When you click the edit icon, it should set the editingImage in the store
 */
require("@/globals.css");
var react_1 = require("react");
var Trip_View_Image_Store_1 = require("../Trip_View_Image_Store");
var TripContext_1 = require("@/components/TripContext");
var ImagePreview_1 = require("../ImagePreview");
var hi_1 = require("react-icons/hi");
var image_1 = require("next/image");
var EditImageForm_1 = require("../EditImageForm");
var TimeViewGallery = function () {
    var id = react_1.useContext(TripContext_1["default"]).id;
    var _a = Trip_View_Image_Store_1.useQueryTrip(id), trip = _a.data, tripLoading = _a.isLoading, tripError = _a.isLoadingError;
    var _b = Trip_View_Image_Store_1.useQueryTripImages(id), images = _b.data, imagesLoading = _b.isLoading, imagesError = _b.isLoadingError;
    var _c = Trip_View_Image_Store_1.useTripViewStore(), selected_date = _c.selected_date, selected_image_location = _c.selected_image_location, filtered_categories = _c.filtered_categories;
    // Create refs for each date
    var dateRefs = react_1.useRef({});
    var groupedOrderedImagesByDay = react_1.useMemo(function () {
        var groupImagesByDay = function (images) {
            var grouped = [];
            if (!trip)
                return [];
            if (!images)
                return [];
            //iterate through dates of trip
            var start_date = new Date(trip.start_date);
            start_date.setHours(0, 0, 0, 0);
            var end_date = new Date(trip.end_date);
            end_date.setHours(23, 59, 59, 999);
            var current_date = new Date(trip.start_date);
            while (current_date.getTime() <= end_date.getTime()) {
                var imagesForDay = images
                    .filter(function (image) {
                    return (new Date(image.created_at).toDateString() ===
                        current_date.toDateString());
                })
                    .filter(function (image) {
                    return !filtered_categories.includes(image.category || '');
                })
                    .sort(function (a, b) {
                    return (new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime());
                });
                //push to the images for the day
                if (imagesForDay.length > 0) {
                    grouped.push({
                        date: new Date(current_date),
                        images: imagesForDay
                    });
                }
                current_date.setDate(current_date.getDate() + 1);
            }
            return grouped;
        };
        return groupImagesByDay(images);
    }, [images, trip]);
    var selectedDate = react_1.useMemo(function () {
        if (!trip)
            return new Date().toISOString();
        // Parse the start date as UTC
        var startDate = new Date(Date.UTC(new Date(trip.start_date).getUTCFullYear(), new Date(trip.start_date).getUTCMonth(), new Date(trip.start_date).getUTCDate()));
        // Add selected_date days to the start date
        startDate.setUTCDate(startDate.getUTCDate() + selected_date);
        // Return the date as a UTC timestamp string
        //Thu, 19 Oct 2023 00:00:00 GMT
        //Split after the 2023, 2022, 2024,  etc. and remove comma
        //Thu Oct 19 2023
        //this is the formatt I want it in
        //get the Day of the week, Month, Day, Year
        var day = startDate.toUTCString().split(' ')[0].replace(',', '');
        var month = startDate.toUTCString().split(' ')[1];
        var date = startDate.toUTCString().split(' ')[2];
        var year = startDate.toUTCString().split(' ')[3];
        return day + " " + date + " " + month + " " + year;
    }, [trip, selected_date]);
    var setSelectedDate = function (date) {
        if (!date)
            return;
        if (!trip)
            return;
        //create utc date from date string
        var newDate = new Date(date);
        var startDate = new Date(trip.start_date);
        var selectedDate = (newDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { selected_date: Math.floor(selectedDate) });
        });
    };
    var handleScroll = function (event) {
        var containerTop = event.currentTarget.getBoundingClientRect().top;
        var threshold = 50; // Adjust this value as needed
        var closestDate = null;
        Object.keys(dateRefs.current).forEach(function (date) {
            var ref = dateRefs.current[date];
            if (ref) {
                var refTop = ref.getBoundingClientRect().top;
                if (refTop - containerTop < threshold &&
                    refTop - containerTop > -threshold) {
                    closestDate = date;
                }
            }
        });
        //add a day to the selected date
        setSelectedDate(closestDate);
    };
    if (tripLoading || imagesLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (tripError) {
        return React.createElement("div", null, "Error loading trip");
    }
    if (imagesError) {
        return React.createElement("div", null, "Error loading images");
    }
    // Scroll to the corresponding date
    var scrollToGroup = function (date) {
        var ref = dateRefs.current[date];
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth' });
        }
    };
    // Now Render the described UI
    // Now Render the described UI
    return (React.createElement("div", null,
        React.createElement(ImagePreview_1["default"], null),
        React.createElement("ul", { className: "flex space-x-4 overflow-x-auto bg-gray-200 p-2 rounded-t-lg border-b border-gray-300" }, groupedOrderedImagesByDay.map(function (group) { return (React.createElement("li", { key: group.date.toDateString(), className: "cursor-pointer px-4 py-2 rounded-lg shadow-md transition-colors " + (selectedDate === group.date.toDateString()
                ? 'bg-gray-400 text-white'
                : 'bg-white hover:bg-gray-100'), onClick: function () { return scrollToGroup(group.date.toDateString()); } }, group.date.toDateString())); })),
        React.createElement("div", { className: "scrollable-container overflow-y-auto h-96 p-4 bg-white rounded-b-lg shadow-lg border border-gray-300", onScroll: handleScroll }, groupedOrderedImagesByDay.map(function (group) {
            return (React.createElement("div", { key: group.date.toDateString(), ref: function (el) {
                    dateRefs.current[group.date.toDateString()] = el;
                }, className: "mb-4" },
                React.createElement(GroupImagesByTime, { images: group.images, date: group.date })));
        }))));
};
var getDateAtLocalTime = function (time_string) {
    // Split the time string to get the date and time parts
    var _a = time_string.split('T'), date = _a[0], time = _a[1];
    // Remove the time zone part from the time
    var time_no_timezone = time.split(/[Z+-]/)[0];
    // Combine the date and time parts to form a new time string
    var time_in_local = date + "T" + time_no_timezone;
    // Create a new Date object from the combined time string
    return new Date(time_in_local);
};
var GroupImagesByTime = function (_a) {
    var images = _a.images, date = _a.date;
    // group images into SubRangeOfImages
    var selected_image_location = Trip_View_Image_Store_1.useTripViewStore().selected_image_location;
    var groupedSubRangeImages = function (images, date) {
        var current_hour = 0;
        //make start_hour to be the hour of the first image
        if (images.length > 0) {
            current_hour = new Date(getDateAtLocalTime(images[0].created_at)).getHours();
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
                return (new Date(getDateAtLocalTime(image.created_at)).getHours() ===
                    current_hour);
            });
            //append list of images to current_subrange
            current_subrange.images = current_subrange.images.concat(images_for_hour);
            current_hour += 1;
            var images_for_next_hour = images.filter(function (image) {
                new Date(getDateAtLocalTime(image.created_at)).getHours() ===
                    current_hour;
            });
            var number_of_images = images_for_hour.length;
            while (number_of_images + images_for_next_hour.length <= 6) {
                current_hour++;
                //append list of images to current_subrange
                current_subrange.images =
                    current_subrange.images.concat(images_for_next_hour);
                number_of_images += images_for_next_hour.length;
                images_for_next_hour = images.filter(function (image) {
                    var passes_filter = new Date(getDateAtLocalTime(image.created_at)).getHours() ===
                        current_hour;
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
                ? Math.max(current_hour, new Date(getDateAtLocalTime(current_subrange.images[current_subrange.images.length - 1]
                    .created_at)).getHours())
                : current_hour;
            current_subrange.end_hour = max_hour;
            list_of_subranges.push(current_subrange);
            ///return list_of_subranges;
        }
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
exports["default"] = TimeViewGallery;
