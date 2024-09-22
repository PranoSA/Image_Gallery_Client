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
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var TripContext_1 = require("../TripContext");
var react_color_1 = require("react-color");
var react_1 = require("react");
var fa6_1 = require("react-icons/fa6");
require("@/form-modal.css");
var AddPathsForm = function () {
    var id = react_1.useContext(TripContext_1["default"]).id;
    var handleCloseModal = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { adding_paths: false });
        });
    };
    var adding_paths = Trip_View_Image_Store_1.useTripViewStore().adding_path;
    var onSubmit = function (formData) {
        submitModal(formData);
    };
    var isOpen = react_1.useMemo(function () {
        return adding_paths;
    }, [adding_paths]);
    var onClose = function () {
        Trip_View_Image_Store_1.tripViewStore.setState(function (state) {
            return __assign(__assign({}, state), { adding_paths: true });
        });
    };
    var submitModal = function (formData) {
        var formDataObj = new FormData();
        formDataObj.append('kml_file', formData.file);
        formDataObj.append('description', formData.description);
        formDataObj.append('name', formData.name);
        formDataObj.append('color_r', formData.color_r);
        formDataObj.append('color_g', formData.color_g);
        formDataObj.append('color_b', formData.color_b);
        formDataObj.append('style', formData.style);
        formDataObj.append('thickness', formData.width);
        formDataObj.append('start_date', formData.start_date);
        formDataObj.append('end_date', formData.end_date);
        fetch(process.env.NEXT_PUBLIC_API_URL + "/trip/" + id + "/paths", {
            method: 'POST',
            body: formDataObj
        })
            .then(function (response) { return response.json(); })
            .then(function (data) {
            console.log('Success:', data);
            handleCloseModal();
        })["catch"](function (error) {
            console.error('Error:', error);
        });
    };
    var _a = react_1.useState({
        file: null,
        description: '',
        name: '',
        color: { r: 0, g: 0, b: 0 },
        style: 'solid',
        width: '',
        start_date: '',
        end_date: ''
    }), formData = _a[0], setFormData = _a[1];
    var handleChangeLineStyle = function (e) {
        setFormData(__assign(__assign({}, formData), { style: e.target.value }));
    };
    var handleChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value, files = _b.files;
        setFormData(__assign(__assign({}, formData), (_a = {}, _a[name] = files ? files[0] : value, _a)));
    };
    var handleColorChange = function (color) {
        setFormData(__assign(__assign({}, formData), { color: {
                r: color.rgb.r,
                g: color.rgb.g,
                b: color.rgb.b
            } }));
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        onSubmit(__assign(__assign({}, formData), { color_r: formData.color.r, color_g: formData.color.g, color_b: formData.color.b }));
    };
    var canvasRef = react_1.useRef(null);
    react_1.useEffect(function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Set the line style
        ctx.strokeStyle = "rgb(" + formData.color.r + ", " + formData.color.g + ", " + formData.color.b + ")";
        ctx.lineWidth = parseInt(formData.width);
        // Set the line dash style
        if (formData.style === 'dashed') {
            ctx.setLineDash([10, 10]);
        }
        else if (formData.style === 'dotted') {
            ctx.setLineDash([4, 10]);
        }
        else {
            ctx.setLineDash([]);
        }
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }, [formData]);
    if (!isOpen)
        return (React.createElement("div", { className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" },
            React.createElement("button", { onClick: onClose }, "Add Path")));
    return (React.createElement(React.Fragment, null, isOpen && (React.createElement("div", { className: "modal-overlay", onClick: function (e) { return handleCloseModal(); } },
        React.createElement("div", { className: "modal-content", onClick: function (e) { return e.stopPropagation(); } },
            React.createElement("button", { className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700", onClick: handleCloseModal },
                React.createElement(fa6_1.FaX, { size: 24 })),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "KML File:"),
                    React.createElement("input", { type: "file", name: "file", accept: ".kml", onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Description:"),
                    React.createElement("input", { type: "text", name: "description", value: formData.description, onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Name:"),
                    React.createElement("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Color:"),
                    React.createElement(react_color_1.SketchPicker, { color: formData.color, onChange: handleColorChange })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Style:"),
                    React.createElement("select", { name: "style", value: formData.style, onChange: handleChangeLineStyle, required: true, className: "mt-1 block w-full" },
                        React.createElement("option", { value: "solid" }, "Solid"),
                        React.createElement("option", { value: "dashed" }, "Dashed"),
                        React.createElement("option", { value: "dotted" }, "Dotted"))),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Width:"),
                    React.createElement("input", { type: "number", name: "width", value: formData.width, onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Preview:"),
                    React.createElement("canvas", { ref: canvasRef, width: "300", height: "50", className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "Start Date:"),
                    React.createElement("input", { type: "date", name: "start_date", value: formData.start_date, onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("div", { className: "mb-4" },
                    React.createElement("label", { className: "block text-gray-700" }, "End Date:"),
                    React.createElement("input", { type: "date", name: "end_date", value: formData.end_date, onChange: handleChange, required: true, className: "mt-1 block w-full" })),
                React.createElement("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" }, "Submit")))))));
};
exports["default"] = AddPathsForm;
