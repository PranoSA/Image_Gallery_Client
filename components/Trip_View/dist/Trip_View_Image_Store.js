"use strict";
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
exports.useTripViewStore = exports.tripViewStore = exports.useQueryTripPaths = exports.useQueryTripImages = exports.useQueryTrip = exports.useQueryDaySummary = exports.useUpdateDaySummary = exports.updateDaySummaryMutation = exports.UpdateImage = void 0;
var react_store_1 = require("@tanstack/react-store");
var store_1 = require("@tanstack/store");
var react_query_1 = require("@tanstack/react-query");
var fetchTripImages = function (trip_id) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip_id + "/images")];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.json()];
        }
    });
}); };
//mutation to update image metadata
var updateImageMutation = function (image, trip) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip.id + "/images/" + image.id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(image)
                })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.json()];
        }
    });
}); };
// useQuery hook for updating image metadata with mutation
exports.UpdateImage = function () {
    return react_query_1.useMutation({
        mutationFn: function (_a) {
            var image = _a.image, trip = _a.trip;
            return updateImageMutation(image, trip);
        }
    });
};
var fetchTripPaths = function (trip_id) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip_id + "/paths")];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.json()];
        }
    });
}); };
var fetchTrip = function (trip_id) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip_id)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data[0]];
        }
    });
}); };
var fetchDaySummary = function (trip_id, date) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip_id + "/day_summary/" + date)];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.json()];
        }
    });
}); };
exports.updateDaySummaryMutation = function (trip_id, date, summary) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + trip_id + "/day_summary/" + date, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ summary: summary })
                })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.json()];
        }
    });
}); };
//update the day summary
exports.useUpdateDaySummary = function () {
    return react_query_1.useQuery({
        queryKey: ['update_day_summary'],
        queryFn: function (_a) {
            var trip_id = _a.trip_id, date = _a.date, summary = _a.summary;
            return exports.updateDaySummaryMutation(trip_id, date, summary);
        }
    });
};
exports.useQueryDaySummary = function (trip_id, date) {
    return react_query_1.useQuery({
        queryKey: ['trip', trip_id, 'day_summary', date],
        queryFn: function () { return fetchDaySummary(trip_id, date); }
    });
};
exports.useQueryTrip = function (trip_id) {
    return react_query_1.useQuery({
        queryKey: ['trip', trip_id],
        queryFn: function () { return fetchTrip(trip_id); }
    });
};
exports.useQueryTripImages = function (trip_id) {
    return react_query_1.useQuery({
        queryKey: ['trip', trip_id, 'images'],
        queryFn: function () { return fetchTripImages(trip_id); }
    });
};
exports.useQueryTripPaths = function (trip_id) {
    return react_query_1.useQuery({
        queryKey: ['trip', trip_id, 'paths'],
        queryFn: function () { return fetchTripPaths(trip_id); }
    });
};
exports.tripViewStore = new store_1.Store({
    selected_trip_id: '',
    editingDaySummary: false,
    selected_date: 0,
    selected_images: [],
    selected_image_preview: null,
    selected_image_location: null,
    date_or_time_view: 'date',
    scroll_position: 0,
    editingImage: null,
    viewed_image_index: null,
    get_images_for_time: function (images) {
        //return images order by time
        return images.sort(function (a, b) {
            // convert to epoch, then compare
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
    },
    get_images_for_day: function (selected_date, start_date, images) {
        //return images at that day, ordered by time
        //t
        var dateSearch = new Date(start_date);
        dateSearch.setDate(dateSearch.getDate() + selected_date);
        return images
            .filter(function (image) {
            return (image.created_at.split('T')[0] ===
                dateSearch.toISOString().split('T')[0]);
        })
            .sort(function (a, b) {
            // convert to epoch, then compare
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
    },
    get_unsorted_images: function (images, trip_end_date, trip_start_date) {
        var trip_start_date_epoch = new Date(trip_start_date).getTime();
        var trip_end_date_epoch = new Date(trip_end_date).getTime();
        return images.filter(function (image) {
            return (new Date(image.created_at).getTime() < trip_start_date_epoch ||
                new Date(image.created_at).getTime() > trip_end_date_epoch ||
                !image.created_at);
        });
    }
});
exports.useTripViewStore = function () {
    return react_store_1.useStore(exports.tripViewStore);
};
