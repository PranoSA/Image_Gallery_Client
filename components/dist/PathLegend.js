"use strict";
exports.__esModule = true;
var react_1 = require("react");
//central store for all the paths
var Trip_View_Image_Store_1 = require("./Trip_View/Trip_View_Image_Store");
var TripContext_1 = require("./TripContext");
var PathLegend = function () {
    var id = react_1.useContext(TripContext_1["default"]).id;
    var _a = Trip_View_Image_Store_1.useQueryTripPaths(id), paths = _a.data, isLoading = _a.isLoading, isError = _a.isError;
    var _b = Trip_View_Image_Store_1.useQueryTrip(id), trip = _b.data, tripLoading = _b.isLoading, tripError = _b.isError;
    //get store state
    var _c = Trip_View_Image_Store_1.useTripViewStore(), selected_date = _c.selected_date, paths_open = _c.paths_open;
    //useMemo to get filtered paths based on the selected date
    var filteredPaths = react_1.useMemo(function () {
        if (!trip)
            return [];
        if (!paths)
            return [];
        var current_date = new Date(trip.start_date);
        //add selected_date to the current date, in number of days
        current_date.setDate(current_date.getDate() + selected_date);
        return paths.filter(function (path) {
            var start = new Date(path.start_date).getTime();
            var end = new Date(path.end_date).getTime();
            return start <= current_date.getTime() && end >= current_date.getTime();
        });
    }, [paths, selected_date, trip]);
    "";
    if (tripLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (tripError) {
        return React.createElement("div", null, "Error loading trip");
    }
    if (isError) {
        return React.createElement("div", null, "Error loading paths");
    }
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (paths_open === false) {
        return null;
    }
    if (filteredPaths.length === 0) {
        return null;
    }
    return (React.createElement("div", { className: "absolute top-4 right-4 p-4 bg-white rounded shadow-lg z-50" },
        React.createElement("h2", { className: "text-xl font-bold mb-4" }, "Path Legend"),
        React.createElement("ul", null, filteredPaths.map(function (path) { return (React.createElement("li", { key: path.id, className: "mb-2 flex items-center" },
            React.createElement(PathPreview, { path: path }),
            React.createElement("span", { className: "ml-2" }, path.name))); }))));
};
var PathPreview = function (_a) {
    var path = _a.path;
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
        ctx.strokeStyle = "rgb(" + path.color_r + ", " + path.color_g + ", " + path.color_b + ")";
        ctx.lineWidth = path.thickness;
        // Set the line dash style
        if (path.style === 'dashed') {
            ctx.setLineDash([10, 10]);
        }
        else if (path.style === 'dotted') {
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
    }, [path]);
    return React.createElement("canvas", { ref: canvasRef, width: 100, height: 20 });
};
exports["default"] = PathLegend;
