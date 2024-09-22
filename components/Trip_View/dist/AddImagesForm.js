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
require("@/globals.css");
var Trip_View_Image_Store_1 = require("@/components/Trip_View/Trip_View_Image_Store");
var react_1 = require("react");
var axios_1 = require("axios");
var TripContext_1 = require("../TripContext");
function AddImagesForm() {
    var _this = this;
    var id = react_1.useContext(TripContext_1["default"]).id;
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //when done ... set adding_images to false
            Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
                return __assign(__assign({}, state), { adding_images: false });
            });
            return [2 /*return*/];
        });
    }); };
    var handleSubmit2 = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var formData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    formData = new FormData(event.currentTarget);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"].post(process.env.NEXT_PUBLIC_API_URL + "/trip/" + id + "/images/", formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })];
                case 2:
                    _a.sent();
                    alert('Images uploaded successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error uploading images:', error_1);
                    alert('Failed to upload images');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var closeModal = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { adding_images: false });
        });
    };
    var adding_images = Trip_View_Image_Store_1.useTripViewStore().adding_images;
    return (React.createElement(React.Fragment, null, adding_images && (React.createElement("div", { className: "modal-overlay", onClick: closeModal },
        React.createElement("div", { className: "modal-content", onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("h2", null, "Upload Images"),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "name" }, "Name:"),
                    React.createElement("input", { type: "text", id: "name", name: "name", required: true })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "description" }, "Description:"),
                    React.createElement("textarea", { id: "description", name: "description", required: true })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "images" }, "Images:"),
                    React.createElement("input", { type: "file", id: "image", name: "image", multiple: true, accept: "image/*", required: true })),
                React.createElement("button", { type: "submit", className: "submit-button" }, "Upload")),
            React.createElement("button", { onClick: closeModal, className: "close-modal-button" }, "Close"))))));
}
exports["default"] = AddImagesForm;
