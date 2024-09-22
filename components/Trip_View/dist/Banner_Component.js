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
exports.Banner_Component = void 0;
var Trip_View_Image_Store_1 = require("@/components/Trip_View/Trip_View_Image_Store");
var fa_1 = require("react-icons/fa");
var hi_1 = require("react-icons/hi");
var react_1 = require("react");
var TripContext_1 = require("@/components/TripContext");
exports.Banner_Component = function () {
    //get the information about the trip and the current_date
    var _a = Trip_View_Image_Store_1.useTripViewStore(), selected_date = _a.selected_date, editingDaySummary = _a.editingDaySummary, date_or_time_view = _a.date_or_time_view;
    var selected_trip_id = react_1.useContext(TripContext_1["default"]).id;
    var viewStore = Trip_View_Image_Store_1.useTripViewStore();
    //get the trip information, loading state, and error state from useQueryTrip
    var _b = Trip_View_Image_Store_1.useQueryTrip(selected_trip_id), trip = _b.data, isLoading = _b.isLoading, error = _b.error;
    var selectedDateToDayOfYear = function () {
        if (!trip) {
            //return epoch time
            return new Date().toISOString().split('T')[0];
        }
        var startDate = new Date(trip === null || trip === void 0 ? void 0 : trip.start_date);
        startDate.setDate(startDate.getDate() + selected_date);
        //return string version of the current date
        return new Date(startDate).toISOString().split('T')[0];
    };
    var _c = Trip_View_Image_Store_1.useQueryDaySummary(selected_trip_id, selectedDateToDayOfYear()), daySummary = _c.data, daySummaryLoading = _c.isLoading;
    var _d = react_1.useState(''), daySummaryFormInput = _d[0], setDaySummaryFormInput = _d[1];
    var currentDay = react_1.useMemo(function () {
        // get the selected_day and subtract from the start_date of the trip
        var date = new Date((trip === null || trip === void 0 ? void 0 : trip.start_date) || '1970-01-01');
        date.setDate(date.getDate() + selected_date);
        return date.toDateString();
    }, [selected_date, trip]);
    //set the day summary when the trip is loaded
    if (daySummary && !daySummaryLoading) {
        setDaySummaryFormInput(daySummary);
    }
    if (!selected_trip_id) {
        return null;
    }
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (error) {
        return React.createElement("div", null,
            "Error: ",
            error.message);
    }
    var setEditingDaySummary = function (value) {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { editingDaySummary: value });
        });
    };
    var calculateDaysElapsed = function (start_date, end_date) {
        var start = new Date(start_date);
        var end = new Date(end_date);
        var elapsed = end.getTime() - start.getTime();
        return elapsed / (1000 * 3600 * 24);
    };
    /*
    // get the selected_day and subtract from the start_date of the trip
    const daysElapsed = calculateDaysElapsed(
      trip?.start_date || selected_date,
      selected_date
    );*/
    var handleDayChange = function (direction) {
        var newDate = new Date(selected_date);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1);
        }
        else {
            newDate.setDate(newDate.getDate() + 1);
        }
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { selected_date: direction === 'prev'
                    ? state.selected_date - 1
                    : state.selected_date + 1 });
        });
    };
    function submitDayDescription(event) {
        event.preventDefault();
        //use the mutation hook
        //useUpdateDaySummary({});
        //use the updateDaySummaryMutation to update the day summary
        Trip_View_Image_Store_1.updateDaySummaryMutation(selected_trip_id, 
        // selected_date,
        selectedDateToDayOfYear(), daySummaryFormInput);
        //set the editingDaySummary to false
        setEditingDaySummary(false);
        //update the daySummaryFormInput
        setDaySummaryFormInput(daySummaryFormInput);
    }
    var total_days = function () {
        if (!trip) {
            return 0;
        }
        var start_date = new Date(trip === null || trip === void 0 ? void 0 : trip.start_date);
        var end_date = new Date(trip === null || trip === void 0 ? void 0 : trip.end_date);
        var elapsed = end_date.getTime() - start_date.getTime();
        return Math.ceil(elapsed / (1000 * 3600 * 24)) + 1;
    };
    return (React.createElement("div", { className: "flex justify-around items-center mb-4" },
        React.createElement(fa_1.FaChevronLeft, { onClick: function () {
                if (selected_date !== 0) {
                    handleDayChange('prev');
                }
            }, className: "cursor-pointer " + (selected_date === 0 ? 'cursor-not-allowed opacity-50' : '') }),
        React.createElement("div", { className: "flex flex-col items-center justify-center h-full" },
            React.createElement("div", { className: "w-full flex flex-col items-center" },
                React.createElement("span", { className: "w-full text-center" },
                    "Day # ",
                    selected_date + 1,
                    " / ",
                    total_days()),
                React.createElement("span", { className: "w-full text-center" }, currentDay)),
            React.createElement("div", { className: "flex flex-col items-center mt-4" },
                React.createElement("div", { className: "w-full flex justify-center items-center" },
                    React.createElement(hi_1.HiOutlinePencil, { onClick: function () { return setEditingDaySummary(true); }, className: "cursor-pointer" })),
                editingDaySummary ? (React.createElement("div", { className: "w-full flex flex-col items-center" },
                    React.createElement("textarea", { value: daySummaryFormInput || '', onChange: function (e) { return setDaySummaryFormInput(e.target.value); }, className: "w-full h-40 p-4 max-w-2xl" }),
                    React.createElement("button", { onClick: submitDayDescription, className: "mt-2" }, "Save"),
                    React.createElement("button", { onClick: function () { return setEditingDaySummary(false); }, disabled: !editingDaySummary }, "Cancel"))) : (React.createElement("div", { className: "w-full text-center" }, daySummary)))),
        React.createElement(fa_1.FaChevronRight, { onClick: function () {
                if (selected_date < total_days() - 1) {
                    handleDayChange('next');
                }
            }, className: "cursor-pointer " + (selected_date >= total_days() - 1
                ? 'cursor-not-allowed opacity-50'
                : '') })));
};
