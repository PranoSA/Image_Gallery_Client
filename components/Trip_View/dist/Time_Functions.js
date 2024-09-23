"use strict";
/**

These functions will aim to provide a consisten view

This application does NOT care about timestamps,

so everything should just be converted to UTC times


*/
exports.__esModule = true;
exports.timeFromString = exports.dateFromString = void 0;
//this function takes in a date string and returns a date
var dateFromString = function (dateString) {
    // This should parse the date into a time-zone agnostic
    // so if 2012-01-01 is passed in , no matter what time zone the viewer is in
    // the time should be 2012-01-01
    var _a = dateString.split('-').map(function (x) { return parseInt(x); }), year = _a[0], month = _a[1], day = _a[2];
    return new Date(year, month - 1, day);
};
exports.dateFromString = dateFromString;
// This function will take in a timestamp string and return a date
var timeFromString = function (timeString) {
    // This should parse the time into a time-zone agnostic
    // so if 2012-01-01T12:00:00 is passed in , no matter what time zone the viewer is in
    // the time should be 2012-01-01T12:00:00
    console.log('timeString', timeString);
    //print the type of the timeString
    console.log('timeString type', typeof timeString);
    //check if the type is a Date
    if (timeString instanceof Object) {
        //extrapolate the time values, such as hours, minutes, seconds , year, month, day
        var hours_1 = timeString.getHours();
        var minutes_1 = timeString.getMinutes();
        var seconds_1 = timeString.getSeconds();
        var year = timeString.getFullYear();
        var month = timeString.getMonth();
        var day = timeString.getDate();
        //get the current time zone offset
        var offset = timeString.getTimezoneOffset();
        //add the offset to the time
        var new_time = new Date(year, month, day, hours_1, minutes_1, seconds_1);
        //add the offset to the time
        new_time.setMinutes(new_time.getMinutes() + offset);
        return new_time;
    }
    console.log('timeString', timeString);
    //test if the timeStrine string matches the regex
    if (!timeString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        //throw new Error('Invalid time string');
        //return epoch
        console.error('Invalid time string');
        return new Date(0);
    }
    var _a = timeString.split('T'), date = _a[0], time = _a[1];
    var _b = time.split(':').map(function (x) { return parseInt(x); }), hours = _b[0], minutes = _b[1], seconds = _b[2];
    return new Date(dateFromString(date).setHours(hours, minutes, seconds));
};
exports.timeFromString = timeFromString;
