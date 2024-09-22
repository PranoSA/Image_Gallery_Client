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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/*      {view === 'date' ? (
        <button onClick={() => setView('time')}>Switch to Time View</button>
      ) : (
        <button onClick={() => setView('date')}>Switch to Date View</button>
      )}

      {view === 'time' ? TimeViewGallery({}) : Image_View_ByDate({})}
*/
var react_1 = require("react");
var Image_View_ByDate_1 = require("@/components/Trip_View/Date_View/Image_View_ByDate");
var Time_View_Gallery_1 = require("@/components/Trip_View/Time_View/Time_View_Gallery");
var fa_1 = require("react-icons/fa");
var react_query_1 = require("@tanstack/react-query");
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var TripContext_1 = require("@/components/TripContext");
var react_2 = require("react");
var Trip_View_Image_Store_2 = require("./Trip_View_Image_Store");
var AddImagesForm_1 = require("./AddImagesForm");
var SelectionComponentGallery = function () {
    var date_or_time_view = Trip_View_Image_Store_2.useTripViewStore().date_or_time_view;
    var store = Trip_View_Image_Store_1.tripViewStore;
    var setView = function (view) {
        store.setState(function (state) {
            return __assign(__assign({}, state), { date_or_time_view: view });
        });
    };
    //pre-render TimeViewGallery
    return (React.createElement("div", { className: "text-center my-5" },
        React.createElement(AddImagesForm_1["default"], null),
        React.createElement("div", { className: "flex justify-center" },
            React.createElement("button", { onClick: function () {
                    store.setState(function (state) {
                        return __assign(__assign({}, state), { adding_images: true });
                    });
                }, className: "px-4 py-2 bg-green-500 text-white rounded" },
                React.createElement(fa_1.FaPlus, null))),
        React.createElement("div", { className: "mb-5 flex justify-around gap-4" },
            React.createElement("button", { onClick: function () { return setView('time'); }, className: "px-4 py-2 text-lg cursor-pointer rounded flex items-center justify-center gap-2 " + (date_or_time_view === 'time'
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-blue-500 text-white'), disabled: date_or_time_view === 'time' },
                React.createElement(fa_1.FaClock, null),
                "Time View"),
            React.createElement("button", { onClick: function () { return setView('date'); }, className: "px-4 py-2 text-lg cursor-pointer rounded flex items-center justify-center gap-2 " + (date_or_time_view === 'date'
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-green-500 text-white'), disabled: date_or_time_view === 'date' },
                React.createElement(fa_1.FaCalendar, null),
                "Date View")),
        date_or_time_view === 'time' ? (React.createElement(Time_View_Gallery_1["default"], null)) : (React.createElement(Image_View_ByDate_1["default"], null))));
};
var SampleUseEffectErrorComponent1 = function () {
    var _a = react_1.useState(null), data = _a[0], setData = _a[1];
    react_1.useEffect(function () {
        console.log('Fetching time view data...');
        // Simulate data fetching
        setTimeout(function () {
            setData({ view: 'time', content: 'Time view contenzzzzzt' });
        }, 1000);
    }, []);
    if (!data) {
        return React.createElement("div", null, "Loading...");
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Time View"),
        React.createElement("pre", null, JSON.stringify(data, null, 2))));
};
var SampleUseEffectErrorComponent12 = function () {
    var _a = react_1.useState(null), data = _a[0], setData = _a[1];
    react_1.useEffect(function () {
        console.log('Fetching time view data...');
        // Simulate data fetching
        setTimeout(function () {
            setData({ view: 'time2', content: 'Time view content2zzzz' });
        }, 1000);
    }, []);
    if (!data) {
        return React.createElement("div", null, "Loading...");
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Time Other Content View"),
        React.createElement("pre", null, JSON.stringify(data, null, 2))));
};
var fetchTimeViewData = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Fetching time view data...');
                // Simulate data fetching
                //wait for 1 second
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 1:
                // Simulate data fetching
                //wait for 1 second
                _a.sent();
                return [2 /*return*/, {
                        view: 'time',
                        content: 'Time view content'
                    }];
        }
    });
}); };
var SampleUseQueryComponent1 = function () {
    var _a = react_query_1.useQuery({
        queryKey: ['timeViewData'],
        queryFn: fetchTimeViewData
    }), data = _a.data, isLoading = _a.isLoading, error = _a.error;
    var id = react_2.useContext(TripContext_1["default"]).id;
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, tripIsLoading = _b.isLoading, tripError = _b.error;
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (error) {
        return React.createElement("div", null,
            "Error: ",
            error.message);
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Time View"),
        React.createElement("pre", null, JSON.stringify(data, null, 2)),
        React.createElement("h1", null, " Trip Data"),
        React.createElement("pre", null, JSON.stringify(trip, null, 2))));
};
var fetchDateViewData = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                setTimeout(function () {
                    resolve({ view: 'date', content: 'Date view content' });
                }, 1000);
            })];
    });
}); };
var TimeViewGallery2 = function () {
    var _a = react_query_1.useQuery({
        queryKey: ['dateViewData'],
        queryFn: fetchDateViewData
    }), data = _a.data, isLoading = _a.isLoading, error = _a.error;
    var id = react_2.useContext(TripContext_1["default"]).id;
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, tripIsLoading = _b.isLoading, tripError = _b.error;
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (error) {
        return React.createElement("div", null,
            "Error: ",
            error.message);
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Date View"),
        React.createElement("pre", null, JSON.stringify(data, null, 2)),
        React.createElement("h1", null, " Trip Data"),
        React.createElement("pre", null, JSON.stringify(trip, null, 2))));
};
var SampleUseQueryComponent2 = function () {
    var _a = react_query_1.useQuery({
        queryKey: ['dateViewData'],
        queryFn: fetchDateViewData
    }), data = _a.data, isLoading = _a.isLoading, error = _a.error;
    var id = react_2.useContext(TripContext_1["default"]).id;
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, tripIsLoading = _b.isLoading, tripError = _b.error;
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (error) {
        return React.createElement("div", null,
            "Error: ",
            error.message);
    }
    return (React.createElement("div", null,
        React.createElement("h1", null, "Date View"),
        React.createElement("pre", null, JSON.stringify(data, null, 2)),
        React.createElement("h1", null, " Trip Data"),
        React.createElement("pre", null, JSON.stringify(trip, null, 2))));
};
exports["default"] = SelectionComponentGallery;
