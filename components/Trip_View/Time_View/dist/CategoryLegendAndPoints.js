"use strict";
//this component will take in a reference to a open layer map and render a legend and a convex hull
exports.__esModule = true;
var ol_1 = require("ol");
var Trip_View_Image_Store_1 = require("../Trip_View_Image_Store");
require("./CategoryLegend.css");
var Time_Functions_1 = require("@/components/Trip_View/Time_Functions");
var react_1 = require("react");
var TripContext_1 = require("@/components/TripContext");
var proj_1 = require("ol/proj");
var geom_1 = require("ol/geom");
var turf = require("@turf/turf");
var style_1 = require("ol/style");
var Vector_1 = require("ol/source/Vector");
//magnifying glass
var fa_1 = require("react-icons/fa");
var colored_index = [
    "rgb(255,0,0)",
    "rgb(0,255,0)",
    "rgb(0,0,255)",
    "rgb(255,255,0)",
    "rgb(0,255,255)",
    "rgb(255,0,255)",
    "rgb(255,255,255)",
    "rgb(0,0,0)",
    "rgb(128,128,128)",
    "rgb(128,0,0)",
    "rgb(128,128,0)",
    "rgb(0,128,0)",
    "rgb(128,0,128)",
    "rgb(0,128,128)",
    "rgb(0,0,128)",
    "rgb(192,192,192)",
    "rgb(128,128,128)",
    "rgb(128,0,0)",
    "rgb(128,128,0)",
    "rgb(0,128,0)",
    "rgb(128,0,128)",
    "rgb(0,128,128)",
    "rgb(0,0,128)",
];
var CategoryLegendAndPoints = function (_a) {
    var _b;
    var map = _a.map, 
    //convexHullLayer,
    addSource = _a.addSource;
    var _c = Trip_View_Image_Store_1.useTripViewStore(), filtered_categories = _c.filtered_categories, filtering_images = _c.filtering_images, selected_date = _c.selected_date;
    var id = react_1.useContext(TripContext_1["default"]).id;
    //ref to vector Layer for convex hull
    //const convexHullLayer = useRef<VectorLayer | null>(null);
    var convexHullSource = react_1.useRef(new Vector_1["default"]());
    var tripsState = Trip_View_Image_Store_1.useQueryTrip(id);
    var imagesState = Trip_View_Image_Store_1.useQueryTripImages(id);
    var currentDay = react_1.useMemo(function () {
        var _a;
        //selected_date is a number after the start date
        var start_date = (_a = tripsState.data) === null || _a === void 0 ? void 0 : _a.start_date;
        if (!start_date) {
            return '1970-01-01';
        }
        var date = new Date(start_date);
        date.setDate(date.getDate() + selected_date);
        return date.toISOString().split('T')[0];
    }, [(_b = tripsState.data) === null || _b === void 0 ? void 0 : _b.start_date, selected_date]);
    // get the categories relevant to the day and filter o
    var categories = react_1.useMemo(function () {
        var _a;
        var categoryies = ((_a = tripsState.data) === null || _a === void 0 ? void 0 : _a.categories) || [];
        var relevant_categories = categoryies
            .filter(function (category) {
            var start_date = Time_Functions_1.dateFromString(category.start_date);
            var end_date = Time_Functions_1.dateFromString(category.end_date);
            var current_day = Time_Functions_1.dateFromString(currentDay);
            return current_day >= start_date && current_day <= end_date;
        })
            //and make sure they are not selected in selected_categories
            .filter(function (category) {
            return !filtered_categories.includes(category.category);
        });
        return relevant_categories.map(function (category) { return category.category; });
    }, [currentDay, tripsState.data, filtered_categories]);
    // colored categories
    var coloredCategories = react_1.useMemo(function () {
        var categorical = categories.map(function (category, i) {
            var color = colored_index[i % colored_index.length];
            return {
                category: category,
                color: color
            };
        });
        console.log('Updating Colored Categories', categorical);
        return {
            zoom_to_category: function (category) { },
            categories: categorical
        };
    }, [categories]);
    // Draw a Convex Hull with a margin, first clearing the previous convex hull
    react_1.useEffect(function () {
        console.log('Drawing Convex Hull');
        if (!map)
            return;
        if (!filtering_images) {
            //set an empty vector source
            convexHullSource.current.clear();
            addSource(convexHullSource.current);
        }
        //add a random square with black border around [20,50] [30,50], [30,60], [20,60]
        var square = new ol_1.Feature({
            geometry: new geom_1.Polygon([
                [
                    proj_1.fromLonLat([20, 50]),
                    proj_1.fromLonLat([30, 50]),
                    proj_1.fromLonLat([30, 60]),
                    proj_1.fromLonLat([20, 60]),
                    proj_1.fromLonLat([20, 50]),
                ],
            ])
        });
        //add to the source
        square.setStyle(new style_1.Style({
            fill: new style_1.Fill({
                color: 'rgba(0,0,0,0)'
            }),
            stroke: new style_1.Stroke({
                color: 'rgba(0,0,0,1)',
                width: 10
            })
        }));
        //clear the previous convex hull
        convexHullSource.current.clear();
        convexHullSource.current.addFeature(square);
        //create points from relevant images for each category
        coloredCategories.categories.forEach(function (category) {
            var _a, _b;
            console.log('Convex Hull Category', category.category);
            // get related images
            var images_filtered = (_a = imagesState.data) === null || _a === void 0 ? void 0 : _a.filter(function (image) {
                return image.category === category.category;
            });
            console.log('Convex Hull Images Filtered', images_filtered);
            if (!filtering_images) {
                //set an empty vector source
                convexHullSource.current.clear();
                addSource(convexHullSource.current);
                return;
                null;
            }
            if (!images_filtered) {
                return;
                null;
            }
            // create points
            var points = images_filtered
                .map(function (image) {
                return [parseFloat(image.long), parseFloat(image.lat)];
            })
                .filter(function (point) {
                return point[0] != 0 || point[1] != 0;
            });
            console.log('New Convex Hull Points', points);
            //if length is less than 2 - draw a circle
            if (points.length == 1) {
                //draw a circle around point with the color of the category
                var new_feature = new ol_1.Feature({
                    geometry: new geom_1.Point(proj_1.fromLonLat(points[0]))
                });
                //Draw the Point with a color circle that is not filled in around it
                new_feature.setStyle(new style_1.Style({
                    fill: new style_1.Fill({
                        color: "" + category.color
                    }),
                    stroke: new style_1.Stroke({
                        color: category.color,
                        width: 5
                    })
                }));
            }
            // draw convex hull with margin and color for each category
            if (points.length == 2) {
                //draw a turf circle around the two points
                var center = turf.center(turf.points(points));
                if (!center)
                    return;
                var buffered = turf.buffer(center, 0.01, {
                    units: 'kilometers'
                });
                if (!buffered)
                    return;
                //use fromLonLat to transform the coordinates
                var transformed_coordinates = buffered.geometry.coordinates[0].map(function (point) {
                    //@ts-ignore
                    return proj_1.fromLonLat([point[0], point[1]]);
                });
                var polygonFeature = new ol_1.Feature({
                    geometry: new geom_1.Polygon([
                        buffered.geometry.coordinates[0],
                    ])
                });
                //set the color of the polygon
                polygonFeature.setStyle(new style_1.Style({
                    fill: new style_1.Fill({
                        color: category.color
                    })
                }));
            }
            if (points.length > 2) {
                console.log('Creating convex hull for category', category.category);
                //draw convex hull
                var hull = turf.convex(turf.points(points));
                if (hull) {
                    var buffered_hull = turf.buffer(hull, 0.01, {
                        units: 'kilometers'
                    });
                    if (!buffered_hull)
                        return;
                    //transform the coordinates to EPSG:3857
                    var transformed_coordinates = buffered_hull.geometry.coordinates[0].map(function (point) {
                        //@ts-ignore
                        return proj_1.fromLonLat([point[0], point[1]]);
                    });
                    var polygonFeature = new ol_1.Feature({
                        geometry: new geom_1.Polygon([
                            transformed_coordinates,
                        ])
                    });
                    //set the color of the polygon
                    polygonFeature.setStyle(new style_1.Style({
                        stroke: new style_1.Stroke({
                            color: category.color,
                            width: 8
                        })
                    }));
                    convexHullSource.current.addFeature(polygonFeature);
                    //print coordinates of the convex hull
                    console.log('Convex Hull Coordinates', (_b = polygonFeature.getGeometry()) === null || _b === void 0 ? void 0 : _b.getExtent());
                    //@ts-ignore
                    //convexHullLayer.current?.getSource().addFeature(polygonFeature);
                    console.log('Convex Hull Feature', polygonFeature);
                }
            }
        });
        //add the convex hull layer to the map
        addSource(convexHullSource.current);
        //draw convex hull
    }, [
        coloredCategories.categories,
        filtered_categories,
        filtering_images,
        imagesState.data,
        map,
        selected_date,
    ]);
    if (!filtering_images) {
        console.log('No filtered categories');
        return null;
    }
    //zoom to category
    var zoom_to_category = function (category) {
        var _a;
        console.log('Zoom to Category', category);
        //get the images for the category
        var images_category = (_a = imagesState.data) === null || _a === void 0 ? void 0 : _a.filter(function (image) {
            return image.category === category;
        });
        if (!images_category) {
            return;
        }
        //filter out images with 0,0 coordinates
        var images = images_category.filter(function (image) {
            return image.lat != '0' && image.long != '0';
        });
        //get the coordinates for the images
        var coordinates = images.map(function (image) {
            return [parseFloat(image.long), parseFloat(image.lat)];
        });
        //get the center of the coordinates
        var center = turf.center(turf.points(coordinates));
        if (!center) {
            return;
        }
        //get the max of {lon_max-lon_min, lat_max-lat_min}
        var max_lon = Math.max.apply(Math, coordinates.map(function (coordinate) {
            return coordinate[0];
        }));
        var min_lon = Math.min.apply(Math, coordinates.map(function (coordinate) {
            return coordinate[0];
        }));
        var max_lat = Math.max.apply(Math, coordinates.map(function (coordinate) {
            return coordinate[1];
        }));
        var min_lat = Math.min.apply(Math, coordinates.map(function (coordinate) {
            return coordinate[1];
        }));
        var l = 's';
        var max_diff = Math.max(max_lon - min_lon, max_lat - min_lat);
        //determine zoom level based on max_diff
        // and center the map on the center of the coordinates
        var zoom = 9 - Math.log2(Math.abs(max_diff));
        //zoom to the center
        map.getView().animate({
            center: proj_1.fromLonLat(center.geometry.coordinates),
            zoom: zoom,
            duration: 2000
        });
    };
    //add the category legend component to the map
    return (React.createElement(CategoryLegendComponent, { categories: coloredCategories.categories, zoom_to_category: zoom_to_category }));
};
var CategoryLegendComponent = function (_a) {
    var categories = _a.categories, zoom_to_category = _a.zoom_to_category;
    console.log('Categories for legend', categories);
    return (React.createElement("div", { className: "absolute top-0 left-0 m-4 p-4 bg-white bg-opacity-75 rounded-lg shadow-lg w-1/3" },
        React.createElement("h3", { className: "text-xl font-semibold mb-2" }, "Categories"),
        React.createElement("ul", null, categories.map(function (category) { return (React.createElement("li", { key: category.category, className: "flex items-center mb-2" },
            React.createElement("span", { className: "category-legend-color w-4 h-4 inline-block mr-2", style: { backgroundColor: category.color } }),
            category.category,
            React.createElement("span", null,
                React.createElement(fa_1.FaSearchPlus, { className: "ml-2", onClick: function () { return zoom_to_category(category.category); } })))); }))));
};
exports["default"] = CategoryLegendAndPoints;
