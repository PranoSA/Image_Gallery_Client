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
var CoordinateForm_1 = require("@/components/CoordinateForm");
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var react_1 = require("react");
var TripContext_1 = require("../TripContext");
var EditImageForm = function () {
    //Every time editedImage changed, update this state
    // this ammounts to a reselection of the image
    var _a = react_1.useState(null), editedImage = _a[0], setEditedImage = _a[1];
    var id = react_1.useContext(TripContext_1["default"]).id;
    var editingImage = Trip_View_Image_Store_1.useTripViewStore().editingImage;
    //const { data: trip, isLoading, isError } = useQueryTrip(id);
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, isLoading = _b.isLoading, isError = _b.isError;
    var updateImage = Trip_View_Image_Store_1.UpdateImage();
    react_1.useEffect(function () {
        setEditedImage(editingImage);
    }, [editingImage]);
    var submitEditedImage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editedImage)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    //use the update image mutation
                    //UpdateImage().mutate(editedImage, trip?.id || '');
                    //UpdateImage(editedImage, trip?.id || '');
                    /*await UpdateImage().mutate({
                      image: editedImage,
                      trip: trip,
                    });*/
                    if (!trip)
                        return [2 /*return*/];
                    return [4 /*yield*/, updateImage.mutate({ image: editedImage, trip: trip })];
                case 2:
                    _a.sent();
                    //setEditingImage(null)
                    Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                        return __assign(__assign({}, state), { editingImage: null });
                    });
                    setEditedImage(null);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error editing image:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleEditedImageChange = function (e) {
        var _a;
        var field = e.target.name;
        var value = e.target.value;
        if (!editedImage)
            return;
        setEditedImage(__assign(__assign({}, editedImage), (_a = {}, _a[field] = value, _a)));
    };
    var handleDateChange = function (e) {
        //Change the Date of the Edited Image
        if (!editedImage)
            return;
        //This will splitting the created_at and changing the date and joining the time back
        var _a = e.target.value.split('T'), date = _a[0], time = _a[1];
        var new_created_at = date + "T" + editedImage.created_at.split('T')[1];
        setEditedImage(__assign(__assign({}, editedImage), { created_at: new_created_at }));
    };
    var handleTimeChange = function (e) {
        //Change the Time of the Edited Image
        if (!editedImage)
            return;
        //This will splitting the created_at and changing the time and joining the date back
        var _a = editedImage.created_at.split('T'), date = _a[0], time = _a[1];
        var new_time = e.target.value;
        var new_created_at = editedImage.created_at.split('T')[0] + "T" + new_time;
        setEditedImage(__assign(__assign({}, editedImage), { created_at: new_created_at }));
    };
    var cancelEditImage = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { editingImage: null });
        });
    };
    if (!editedImage)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" },
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg" },
            React.createElement("form", { onSubmit: function (e) {
                    e.preventDefault();
                    submitEditedImage();
                } },
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Description:"),
                    React.createElement("input", { type: "text", name: "description", value: (editedImage === null || editedImage === void 0 ? void 0 : editedImage.description) || '', onChange: handleEditedImageChange, className: "w-full px-3 py-2 border rounded-lg" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Name:"),
                    React.createElement("input", { type: "text", name: "name", value: (editedImage === null || editedImage === void 0 ? void 0 : editedImage.name) || '', onChange: handleEditedImageChange, className: "w-full px-3 py-2 border rounded-lg" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Description:"),
                    React.createElement("input", { type: "text", name: "description", value: (editedImage === null || editedImage === void 0 ? void 0 : editedImage.description) || '', onChange: handleEditedImageChange, className: "w-full px-3 py-2 border rounded-lg" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Created At:"),
                    React.createElement("div", { className: "flex space-x-2" },
                        React.createElement("input", { type: "date", value: editedImage === null || editedImage === void 0 ? void 0 : editedImage.created_at.split('T')[0], onChange: handleDateChange, className: "w-1/2 px-3 py-2 border rounded-lg" }),
                        React.createElement("input", { type: "time", value: editedImage === null || editedImage === void 0 ? void 0 : editedImage.created_at.split('T')[1].split('+')[0].split('-')[0], onChange: handleTimeChange, className: "w-1/2 px-3 py-2 border rounded-lg" }))),
                React.createElement(CoordinateForm_1["default"], { editedImage: editedImage, setEditedImage: setEditedImage }),
                React.createElement("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded-lg", onClick: submitEditedImage }, "Save"),
                React.createElement("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded-lg", onClick: function () { return cancelEditImage(); } }, "Cancel")))));
};
exports["default"] = EditImageForm;
