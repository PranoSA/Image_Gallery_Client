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
    /**
     *
     * Used To Track Changes to the Form When Editing Degrees/Minutes/Seconds
     */
    var _f = react_1.useState({
        degrees: 0,
        minutes: 0,
        seconds: 0
    }), degreesMinutesSecondsLat = _f[0], setDegreesMinutesSecondsLat = _f[1];
    var _g = react_1.useState({
        degrees: 0,
        minutes: 0,
        seconds: 0
    }), degreesMinutesSecondsLong = _g[0], setDegreesMinutesSecondsLong = _g[1];
    /**
     *
     *  Used To Bubble Up Changes to the Edited Image
     * In The Case of the User Changing the Degrees/Minutes/Seconds
     */
    var changeToDecimal = function () {
        var decimalDegreesLong = degreesMinutesSecondsLong.degrees +
            degreesMinutesSecondsLong.minutes / 60 +
            degreesMinutesSecondsLong.seconds / 3600;
        if (!editedImage)
            return;
        if (WorE === 'W') {
            setEditedImage(__assign(__assign({}, editedImage), { long: "-" + decimalDegreesLong }));
            setLocalLong("-" + decimalDegreesLong);
        }
        if (WorE === 'E') {
            setEditedImage(__assign(__assign({}, editedImage), { long: "" + decimalDegreesLong }));
            setLocalLong("" + decimalDegreesLong);
        }
        var decimalDegreesLat = degreesMinutesSecondsLat.degrees +
            degreesMinutesSecondsLat.minutes / 60 +
            degreesMinutesSecondsLat.seconds / 3600;
        if (Nors === 'N') {
            setEditedImage(__assign(__assign({}, editedImage), { lat: "" + decimalDegreesLat }));
            setLocalLat("" + decimalDegreesLat);
        }
        if (Nors === 'S') {
            setEditedImage(__assign(__assign({}, editedImage), { lat: "-" + decimalDegreesLat }));
            setLocalLat("-" + decimalDegreesLat);
        }
    };
    var changeDecimalToDegrees = function () {
        if (!editedImage)
            return;
        var long = parseFloat(editedImage.long);
        var lat = parseFloat(editedImage.lat);
        //first, test if N or S
        var Nors = lat >= 0 ? 'N' : 'S';
        setNors(Nors);
        //if South, make positive
        long = long < 0 ? -long : long;
        //first, test if E or W
        var WorE = long >= 0 ? 'E' : 'W';
        setWorE(WorE);
        //if West, make positive
        lat = lat < 0 ? -lat : lat;
        var long_deg = Math.floor(Math.abs(long));
        var long_min = Math.floor((Math.abs(long) - long_deg) * 60);
        var long_sec = ((Math.abs(long) - long_deg) * 60 - long_min) * 60;
        var lat_deg = Math.floor(Math.abs(lat));
        var lat_min = Math.floor((Math.abs(lat) - lat_deg) * 60);
        var lat_sec = ((Math.abs(lat) - lat_deg) * 60 - lat_min) * 60;
        setDegreesMinutesSecondsLong({
            degrees: long_deg,
            minutes: long_min,
            seconds: long_sec
        });
        setDegreesMinutesSecondsLat({
            degrees: lat_deg,
            minutes: lat_min,
            seconds: lat_sec
        });
    };
    //what is the input html event called again?
    //Not Sure if this part is necessary as its part of the props
    /*
  
  */
    var _h = react_1.useState(''), googleInput = _h[0], setGoogleInput = _h[1];
    var previousSetting = react_1.useRef('decimal');
    react_1.useEffect(function () {
        setCoordinateOption(previousSetting.current);
    }, [editedImage]);
    var setFromGoogleCoordinates = function () {
        previousSetting.current = coordinateOption;
        setCoordinateOption('google');
        //format 34°18'06.7"N 119°18'06.7"W
        var regex = /(\d+)°(\d+)'(\d+\.\d+)"([N|S|E|W]) (\d+)°(\d+)'(\d+\.\d+)"([N|S|E|W])/g;
        if (!editedImage)
            return;
        //find long in degrees
        var input = googleInput;
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
            setDegreesMinutesSecondsLat({
                degrees: degrees_lat,
                minutes: minutes_lat,
                seconds: seconds_lat
            });
            setDegreesMinutesSecondsLong({
                degrees: degrees_long,
                minutes: minutes_long,
                seconds: seconds_long
            });
            //change to degrees
            changeToDecimal();
            setNors(Nors_1);
            setWorE(WorE_1);
            //set degrees
            //make sure its in
        }
        //test format
    };
    var handleChangesToDegreesMinutesSeconds = function (e) {
        //check if long_deg, long_min, long_sec, lat_deg, lat_min, lat_sec
        var field = e.target.name;
        if (field === 'long_deg') {
            setDegreesMinutesSecondsLong(__assign(__assign({}, degreesMinutesSecondsLong), { degrees: parseInt(e.target.value) }));
        }
        if (field === 'long_min') {
            setDegreesMinutesSecondsLong(__assign(__assign({}, degreesMinutesSecondsLong), { minutes: parseInt(e.target.value) }));
        }
        if (field === 'long_sec') {
            setDegreesMinutesSecondsLong(__assign(__assign({}, degreesMinutesSecondsLong), { seconds: parseFloat(e.target.value) }));
        }
        if (field === 'lat_deg') {
            setDegreesMinutesSecondsLat(__assign(__assign({}, degreesMinutesSecondsLat), { degrees: parseInt(e.target.value) }));
        }
        if (field === 'lat_min') {
            setDegreesMinutesSecondsLat(__assign(__assign({}, degreesMinutesSecondsLat), { minutes: parseInt(e.target.value) }));
        }
        if (field === 'lat_sec') {
            setDegreesMinutesSecondsLat(__assign(__assign({}, degreesMinutesSecondsLat), { seconds: parseFloat(e.target.value) }));
        }
        //change to decimal
        changeToDecimal();
    };
    var handleChangeToDecimal = function (e) {
        //check if long or lat
        var field = e.target.name;
        if (!editedImage)
            return;
        var value = e.target.value;
        if (value === '')
            return;
        if (field === 'long') {
            setEditedImage(__assign(__assign({}, editedImage), { long: value }));
        }
        if (field === 'lat') {
            setEditedImage(__assign(__assign({}, editedImage), { lat: value }));
        }
        //change the degrees/minutes/seconds
        changeDecimalToDegrees();
    };
    /**
     * This Handles Changes to Decimal Degrees
     */
    var handleCoordinatesChange = function (e) {
        //check if long or lat
        //check if last change was in minutes
        if (coordinateOption !== 'minutes')
            return;
        if (!editedImage)
            return;
        var field = e.target.name;
        if (field === 'long') {
            setEditedImage(__assign(__assign({}, editedImage), { long: e.target.value }));
        }
        if (field === 'lat') {
            setEditedImage(__assign(__assign({}, editedImage), { lat: e.target.value }));
        }
    };
    var _j = react_1.useState((editedImage === null || editedImage === void 0 ? void 0 : editedImage.lat) || ''), localLat = _j[0], setLocalLat = _j[1];
    var _k = react_1.useState((editedImage === null || editedImage === void 0 ? void 0 : editedImage.long) || ''), localLong = _k[0], setLocalLong = _k[1];
    react_1.useEffect(function () {
        if (editedImage) {
            changeDecimalToDegrees();
        }
    }, []);
    react_1.useEffect(function () {
        if (coordinateOption === 'google') {
            changeToDecimal();
        }
        console.log('changed');
        console.log(editedImage);
    }, [editedImage]);
    /**
     *
     * @param e
     * This handles changes to the degree form
     * @returns
     */
    var handleEditedImageChange = function (e) {
        //check if long or lat
        if (!editedImage)
            return;
        if (coordinateOption !== 'decimal')
            return;
        var field = e.target.name;
        if (field === 'long') {
            setLocalLong(e.target.value);
            setEditedImage(__assign(__assign({}, editedImage), { long: e.target.value }));
            //change the degrees/minutes/seconds
            changeDecimalToDegrees();
        }
        if (field === 'lat') {
            setLocalLat(e.target.value);
            setEditedImage(__assign(__assign({}, editedImage), { lat: e.target.value }));
            //change the degrees/minutes/seconds
            changeDecimalToDegrees();
        }
    };
    return (react_1["default"].createElement("div", null,
        react_1["default"].createElement("div", { className: "mb-4" },
            react_1["default"].createElement("label", { className: "block text-gray-700" }, "Degrees or Minutes"),
            react_1["default"].createElement("select", { name: "degreesInMinutes", value: degreesInMinutes ? 'minutes' : 'decimal', onChange: function (e) {
                    setDegreesInMinutes(e.target.value === 'minutes');
                    if (e.target.value === 'minutes') {
                        changeDecimalToDegrees();
                        setCoordinateOption('minutes');
                    }
                    else {
                        setCoordinateOption('decimal');
                        changeToDecimal();
                        setCoordinateOption('decimal');
                    }
                }, className: "w-full px-3 py-2 border rounded-lg" },
                react_1["default"].createElement("option", { value: "decimal" }, "Decimal"),
                react_1["default"].createElement("option", { value: "minutes" }, "Minutes/Seconds")),
            react_1["default"].createElement("input", { type: "text", name: "google_coordinates", placeholder: "'34\u00B018'06.7'N 119\u00B018'06.7'W", onChange: function (e) { return setGoogleInput(e.target.value); }, className: "w-full px-3 py-2 border rounded-lg" }),
            react_1["default"].createElement("button", { onClick: function (e) {
                    e.preventDefault();
                    setFromGoogleCoordinates();
                }, className: "bg-blue-500 text-white px-4 py-2 rounded-lg" }, "Set From Google Coordinates"),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("div", { className: "flex space-x-2" },
                    react_1["default"].createElement("input", { type: "text", name: "long_deg", placeholder: "Degrees", onChange: handleCoordinatesChange, value: degreesMinutesSecondsLong.degrees, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "long_min", placeholder: "Minutes", onChange: handleCoordinatesChange, value: degreesMinutesSecondsLong.minutes, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "long_sec", placeholder: "Seconds", onChange: handleCoordinatesChange, value: degreesMinutesSecondsLong.seconds, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("select", { value: WorE, onChange: function (e) { return setWorE(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') },
                        react_1["default"].createElement("option", { value: "W" }, "W"),
                        react_1["default"].createElement("option", { value: "E" }, "E"))),
                react_1["default"].createElement("div", { className: "flex space-x-2" },
                    react_1["default"].createElement("input", { type: "text", name: "lat_deg", placeholder: "Degrees", value: degreesMinutesSecondsLat.degrees, onChange: handleEditedImageChange, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "lat_min", placeholder: "Minutes", value: degreesMinutesSecondsLat.minutes, onChange: handleEditedImageChange, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("input", { type: "text", name: "lat_sec", placeholder: "Seconds", value: degreesMinutesSecondsLat.seconds, onChange: handleEditedImageChange, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') }),
                    react_1["default"].createElement("select", { value: Nors, onChange: function (e) { return setNors(e.target.value); }, disabled: coordinateOption === 'decimal', className: "w-1/3 px-3 py-2 border rounded-lg " + (coordinateOption === 'decimal' ? 'bg-gray-200' : '') },
                        react_1["default"].createElement("option", { value: "N" }, "N"),
                        react_1["default"].createElement("option", { value: "S" }, "S")))),
            react_1["default"].createElement("div", { className: "mb-4" },
                react_1["default"].createElement("input", { type: "text", name: "lat", value: localLat || '', onChange: handleCoordinatesChange, disabled: coordinateOption === 'minutes', className: "w-full px-3 py-2 border rounded-lg " + (coordinateOption === 'minutes' ? 'bg-gray-200' : '') }),
                react_1["default"].createElement("input", { type: "text", name: "long", onChange: handleCoordinatesChange, value: localLong || '', disabled: coordinateOption === 'minutes', className: "w-full px-3 py-2 border rounded-lg " + (coordinateOption === 'minutes' ? 'bg-gray-200' : '') })))));
};
exports["default"] = CoordinateForm;
