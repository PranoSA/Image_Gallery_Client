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
var react_1 = require("react");
var CoordinateForm = function (_a) {
    var setEditedImage = _a.setEditedImage, editedImage = _a.editedImage;
    var _b = react_1.useState('W'), WorE = _b[0], setWorE = _b[1];
    var _c = react_1.useState('N'), Nors = _c[0], setNors = _c[1];
    //last editing
    var _d = react_1.useState('decimal'), coordinateOption = _d[0], setCoordinateOption = _d[1];
    var _e = react_1.useState(false), degreesInMinutes = _e[0], setDegreesInMinutes = _e[1];
    // Update the editatedImage based on the google inut
    var setFromGoogleCoordinates = function (value_string) {
        //format 34°18'06.7"N 119°18'06.7"W
        //52°15'0.0"N 21°0'42.0"E
        var regex = /(\d+)°(\d+)'(\d+(\.\d+)?)"([N|S|E|W]) (\d+)°(\d+)'(\d+(\.\d+)?)"([N|S|E|W])/g;
        if (!editedImage)
            return;
        //find long in degrees
        var input = value_string;
        if (regex.test(input)) {
            // split the input into two parts
            var _a = input.split(' '), lat = _a[0], long = _a[1];
            //test if N or S
            var Nors_1 = lat.includes('N') ? 'N' : 'S';
            var degrees_lat = parseInt(lat.split('°')[0]);
            var minutes_lat = parseInt(lat.split('°')[1].split("'")[0]);
            var seconds_lat = parseFloat(lat.split("'")[1].split('"')[0]);
            //test if E or W
            var WorE_1 = long.includes('E') ? 'E' : 'W';
            var degrees_long = parseInt(long.split('°')[0]);
            var minutes_long = parseInt(long.split('°')[1].split("'")[0]);
            var seconds_long = parseFloat(long.split("'")[1].split('"')[0]);
            //get decimal degrees long and lat
            var decimalDegreesLong = degrees_long +
                minutes_long / 60 +
                (seconds_long / 3600) * (WorE_1 === 'W' ? -1 : 1);
            var decimalDegreesLat = degrees_lat +
                minutes_lat / 60 +
                (seconds_lat / 3600) * (Nors_1 === 'S' ? -1 : 1);
            setEditedImage(__assign(__assign({}, editedImage), { lat: "" + decimalDegreesLat, long: "" + decimalDegreesLong }));
            //make sure its in
        }
        //test format
    };
    /**
     * Converts the editedImage data to a google coordinates string
     */
    var googleCoordinatesFromValue = function () {
        //format 34°18'06.7"N 119°18'06.7"W
        var degrees_lat = Math.floor(Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0')));
        var lat_direction = Math.sign(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0')) === 1 ? 'N' : 'S';
        var minutes_lat = Math.floor((Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0')) - degrees_lat) * 60);
        var seconds_lat = Math.floor(((Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0')) - degrees_lat) * 60 -
            minutes_lat) *
            60);
        var degrees_long = Math.floor(Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0')));
        var long_direction = Math.sign(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0')) === 1 ? 'E' : 'W';
        var minutes_long = Math.floor((Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0')) - degrees_long) * 60);
        var seconds_long = Math.floor(((Math.abs(parseFloat((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0')) - degrees_long) * 60 -
            minutes_long) *
            60);
        return degrees_lat + "\u00B0" + minutes_lat + "'" + seconds_lat + "\"" + lat_direction + " " + degrees_long + "\u00B0" + minutes_long + "'" + seconds_long + "\"" + long_direction;
    };
    var setFromLat = function (value) {
        if (!editedImage)
            return;
        setEditedImage(__assign(__assign({}, editedImage), { lat: value }));
    };
    var latFromValue = function () {
        return (editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '';
    };
    var setFromLong = function (value) {
        if (!editedImage)
            return;
        setEditedImage(__assign(__assign({}, editedImage), { long: value }));
    };
    var longFromValue = function () {
        return (editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '';
    };
    /**
     *
     */
    /**
     *
     * @param value
     *
     * Utility Functions
     * @returns
     */
    var old_degrees = function (value) {
        var abs = Math.abs(parseFloat(value));
        return Math.floor(abs);
    };
    var old_minutes = function (value) {
        var abs = Math.abs(parseFloat(value));
        return Math.floor((abs - Math.floor(abs)) * 60);
    };
    var old_seconds = function (value) {
        var abs = Math.abs(parseFloat(value));
        return Math.floor(((abs - Math.floor(abs)) * 60 - old_minutes(value)) * 60);
    };
    var new_from_degres_minutes_seconds = function (degrees, minutes, seconds) {
        return degrees + minutes / 60 + seconds / 3600;
    };
    var setFromLatDegrees = function (value) {
        // set only the degrees
        if (!editedImage)
            return;
        var old_lat_degrees = old_degrees(editedImage.lat || '0');
        var old_lat_minutes = old_minutes(editedImage.lat || '0');
        var old_lat_seconds = old_seconds(editedImage.lat || '0');
        var lat = new_from_degres_minutes_seconds(parseInt(value), old_lat_minutes, old_lat_seconds) * (Nors === 'S' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { lat: "" + lat }));
    };
    var latDegreesFromValue = function () {
        var lat = old_degrees((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0');
        return "" + lat;
    };
    var setFromLongDegrees = function (value) {
        // set only the degrees
        if (!editedImage)
            return;
        var old_long_degrees = old_degrees(editedImage.long || '0');
        var old_long_minutes = old_minutes(editedImage.long || '0');
        var old_long_seconds = old_seconds(editedImage.long || '0');
        var long = new_from_degres_minutes_seconds(parseInt(value), old_long_minutes, old_long_seconds) * (WorE === 'W' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { long: "" + long }));
    };
    var longDegreesFromValue = function () {
        var long = old_degrees((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0');
        return "" + long;
    };
    var setFromLatMinutes = function (value) {
        if (!editedImage)
            return;
        var old_lat_mnutes = old_minutes(editedImage.lat || '0');
        var old_lat_degrees = old_degrees(editedImage.lat || '0');
        var old_lat_seconds = old_seconds(editedImage.lat || '0');
        var lat = new_from_degres_minutes_seconds(old_lat_degrees, parseInt(value), old_lat_seconds) * (Nors === 'S' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { lat: "" + lat }));
    };
    var latMinutesFromValue = function () {
        var lat = old_minutes((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0');
        return "" + lat;
    };
    var setFromLongMinutes = function (value) {
        if (!editedImage)
            return;
        var old_long_mnutes = old_minutes(editedImage.long || '0');
        var old_long_degrees = old_degrees(editedImage.long || '0');
        var old_long_seconds = old_seconds(editedImage.long || '0');
        var long = new_from_degres_minutes_seconds(old_long_degrees, parseInt(value), old_long_seconds) * (WorE === 'W' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { long: "" + long }));
    };
    var longMinutesFromValue = function () {
        var long = old_minutes((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0');
        return "" + long;
    };
    var setFromLatSeconds = function (value) {
        if (!editedImage)
            return;
        var old_lat_seconds = old_seconds(editedImage.lat || '0');
        var old_lat_degrees = old_degrees(editedImage.lat || '0');
        var old_lat_minutes = old_minutes(editedImage.lat || '0');
        var lat = new_from_degres_minutes_seconds(old_lat_degrees, old_lat_minutes, parseInt(value)) * (Nors === 'S' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { lat: "" + lat }));
    };
    var latSecondsFromValue = function () {
        var lat = old_seconds((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || '0');
        return "" + lat;
    };
    var setFromLongSeconds = function (value) {
        if (!editedImage)
            return;
        // old lat minutes is
        var old_long_seconds = old_seconds(editedImage.long || '0');
        var old_long_degrees = old_degrees(editedImage.long || '0');
        var old_long_minutes = old_minutes(editedImage.long || '0');
        var long = new_from_degres_minutes_seconds(old_long_degrees, old_long_minutes, parseInt(value)) * (WorE === 'W' ? -1 : 1);
        setEditedImage(__assign(__assign({}, editedImage), { long: "" + long }));
    };
    var longSecondsFromValue = function () {
        var long = old_seconds((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || '0');
        return "" + long;
    };
    //what is the input html event called again?
    //Not Sure if this part is necessary as its part of the props
    /*
  
  */
    var _f = react_1.useState(''), googleInput = _f[0], setGoogleInput = _f[1];
    var _g = react_1.useState(''), googleSubmitInput = _g[0], setGoogleSubmitInput = _g[1];
    var previousSetting = react_1.useRef('decimal');
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("div", { className: "mb-4" },
            react_1["default"].createElement("label", { className: "block text-gray-700" }, "Degrees or Minutes"),
            react_1["default"].createElement("select", { name: "degreesInMinutes", value: degreesInMinutes ? 'minutes' : 'decimal', onChange: function (e) {
                    setDegreesInMinutes(e.target.value === 'minutes');
                    if (e.target.value === 'minutes') {
                        setCoordinateOption('minutes');
                        previousSetting.current = 'minutes';
                    }
                    else {
                        setCoordinateOption('decimal');
                        previousSetting.current = 'decimal';
                    }
                }, className: "w-full px-3 py-2 border rounded-lg" },
                react_1["default"].createElement("option", { value: "decimal" }, "Decimal"),
                react_1["default"].createElement("option", { value: "minutes" }, "Minutes/Seconds")),
            react_1["default"].createElement("input", { type: "text", name: "google_coordinates", placeholder: "'34\u00B018'06.7'N 119\u00B018'06.7'W", onChange: function (e) { return setFromGoogleCoordinates(e.target.value); }, value: googleCoordinatesFromValue(), className: "w-full px-3 py-2 border rounded-lg" }),
            react_1["default"].createElement("button", { onClick: function (e) {
                    e.preventDefault();
                    //set setting to google
                    setCoordinateOption('google');
                    setGoogleSubmitInput(googleInput);
                    setCoordinateOption(previousSetting.current);
                    //setFromGoogleCoordinates();
                }, className: "bg-blue-500 text-white px-4 py-2 rounded-lg" }, "Set From Google Coordinates"),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("div", { className: "flex space-x-2" },
                    react_1["default"].createElement("input", { type: "text", name: "long_deg", placeholder: "Degrees", onChange: function (e) { return setFromLongDegrees(e.target.value); }, value: longDegreesFromValue(), disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "long_min", placeholder: "Minutes", onChange: function (e) { return setFromLongMinutes(e.target.value); }, value: longMinutesFromValue(), disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "long_sec", placeholder: "Seconds", onChange: function (e) { return setFromLongSeconds(e.target.value); }, value: longSecondsFromValue(), disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("select", { value: WorE, onChange: function (e) { return setWorE(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') },
                        react_1["default"].createElement("option", { value: "W" }, "W"),
                        react_1["default"].createElement("option", { value: "E" }, "E"))),
                react_1["default"].createElement("div", { className: "flex space-x-2" },
                    react_1["default"].createElement("input", { type: "text", name: "lat_deg", placeholder: "Degrees", value: latDegreesFromValue(), onChange: function (e) { return setFromLatDegrees(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "lat_min", placeholder: "Minutes", value: latMinutesFromValue(), onChange: function (e) { return setFromLatMinutes(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "lat_sec", placeholder: "Seconds", value: latSecondsFromValue(), onChange: function (e) { return setFromLatSeconds(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("select", { value: Nors, onChange: function (e) { return setNors(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') },
                        react_1["default"].createElement("option", { value: "N" }, "N"),
                        react_1["default"].createElement("option", { value: "S" }, "S")))),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("input", { type: "text", name: "lat", value: latFromValue(), onChange: function (e) {
                        setFromLat(e.target.value);
                        /*
                        if (coordinateOption === 'minutes') return;
                        setLocalCoordinates({
                          ...localCoordinates,
                          lat: e.target.value,
                        });
                        */
                    }, disabled: coordinateOption === 'minutes', className: "w-full px-3 py-2 border rounded-lg " + (coordinateOption === 'minutes' ? 'bg-gray-200' : '') }),
                react_1["default"].createElement("input", { type: "text", name: "long", onChange: function (e) {
                        setFromLong(e.target.value);
                        /*if (coordinateOption === 'minutes') return;
                        setLocalCoordinates({
                          ...localCoordinates,
                          long: e.target.value,
                        });*/
                    }, value: longFromValue(), disabled: coordinateOption === 'minutes', className: "w-full px-3 py-2 border rounded-lg " + (coordinateOption === 'minutes' ? 'bg-gray-200' : '') })))));
};
exports["default"] = CoordinateForm;
