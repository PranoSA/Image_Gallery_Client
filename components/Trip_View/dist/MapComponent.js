'use client';
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
/***
 *
 * The Map Component will draw in state from the store
 * and primarily from  the tanstack query
 *
 */
var PathLegend_1 = require("@/components/PathLegend");
var react_1 = require("react");
//Open Layers
var Map_1 = require("ol/Map");
var View_1 = require("ol/View");
var Tile_1 = require("ol/layer/Tile");
var OSM_1 = require("ol/source/OSM");
var proj_1 = require("ol/proj");
var ol_1 = require("ol");
var geom_1 = require("ol/geom");
var layer_1 = require("ol/layer");
var source_1 = require("ol/source");
var style_1 = require("ol/style");
var layer_2 = require("ol/layer");
var format_1 = require("ol/format");
// store and tanstack query
var Trip_View_Image_Store_1 = require("./Trip_View_Image_Store");
var TripContext_1 = require("@/components/TripContext");
function MapComponent(_a) {
    var _this = this;
    var _b, _c;
    var _d = _a.height, height = _d === void 0 ? '50vh' : _d;
    //get td from context
    var id = react_1.useContext(TripContext_1["default"]).id;
    var mapRef = react_1.useRef(null);
    var mapInstanceRef = react_1.useRef(null);
    //get the paths and loading state
    var tripsState = Trip_View_Image_Store_1.useQueryTrip(id);
    var pathState = Trip_View_Image_Store_1.useQueryTripPaths(id);
    var imageState = Trip_View_Image_Store_1.useQueryTripImages(id);
    //get information about the day, the image_location
    // for the purpose of filtering paths and stuff and mapopen
    var _e = Trip_View_Image_Store_1.useTripViewStore(), selected_date = _e.selected_date, selected_image_location = _e.selected_image_location, map_open = _e.map_open, get_images_for_day = _e.get_images_for_day, zoom_on_day_change = _e.zoom_on_day_change, image_heat_map = _e.image_heat_map;
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
    //Vector Source To Store Image Location, pretty much the "selected_image_location" corresponding data
    var imageVectorSource = react_1.useRef(new source_1.Vector());
    // javascript to find the path id from the feature
    var pathFromFeature = react_1.useRef({});
    //This is used to track the previous selected image (selected_image_location)
    // So that you can remove it when a new one is selected
    var selectedFeature = react_1.useRef(null);
    // Image Heat Map Layer For The Map
    // Undecided if it should be for all images or just the images for the day
    var imageHeatMapLayer = react_1.useRef(null);
    //add interactivity to the map
    // Quite a bnit confused what these are for
    var _f = react_1.useState(null), pathModalSelected = _f[0], setPathModalSelected = _f[1];
    var _g = react_1.useState({ x: 0, y: 0 }), pathModalPosition = _g[0], setPathModalPosition = _g[1];
    // This is for when mapRef.current is loaded
    //and you need to set mapInstanceRef.current
    //which holds the actual map - the mapRef.current is the div target
    react_1.useEffect(function () {
        //check document is loaded - Don't run on the Serverside
        if (!document) {
            return;
        }
        if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = new Map_1["default"]({
                target: mapRef.current,
                layers: [
                    new Tile_1["default"]({
                        source: new OSM_1["default"]()
                    }),
                    new layer_1.Vector({
                        source: imageVectorSource.current,
                        zIndex: 1000
                    }),
                ],
                view: new View_1["default"]({
                    center: proj_1.fromLonLat([2.3522, 48.8566]),
                    zoom: 2
                })
            });
        }
    }, [mapRef.current]);
    //add marker for when selected_image_location changes
    // This places the marker on the map
    react_1.useEffect(function () {
        var _a;
        if (!selected_image_location)
            return;
        if (((_a = selectedFeature.current) === null || _a === void 0 ? void 0 : _a.get('id')) === selected_image_location.id) {
            imageVectorSource.current.removeFeature(selectedFeature.current);
            //setSelectedImageLocation(null);
            selectedFeature.current = null;
        }
        else {
            var feature = new ol_1.Feature({
                geometry: new geom_1.Point(proj_1.fromLonLat([
                    parseFloat(selected_image_location.long),
                    parseFloat(selected_image_location.lat),
                ])),
                ol_uid: selected_image_location.id,
                id: selected_image_location.id,
                Id: selected_image_location.id
            });
            feature.setStyle(new style_1.Style({
                image: new style_1.Circle({
                    radius: 5,
                    fill: new style_1.Fill({ color: 'black' }),
                    stroke: new style_1.Stroke({
                        color: 'black',
                        width: 2
                    })
                })
            }));
            // Remove old feature
            if (selectedFeature.current) {
                imageVectorSource.current.removeFeature(selectedFeature.current);
            }
            selectedFeature.current = feature;
            imageVectorSource.current.addFeature(feature);
        }
    }, [selected_image_location]);
    //This renders the relevant paths on the map
    react_1.useEffect(function () {
        var trip = tripsState.data;
        var paths = pathState.data;
        if (!selected_date || !trip || !paths)
            return;
        var currentDayDate = new Date(trip.start_date);
        currentDayDate.setDate(currentDayDate.getDate() + selected_date);
        var currentDay = currentDayDate.toISOString().split('T')[0];
        if (!currentDay)
            return;
        var fetchKMLFiles = function () { return __awaiter(_this, void 0, void 0, function () {
            var filteredPaths, _loop_1, _i, filteredPaths_1, path, state_1;
            var _a, _b;
            return __generator(this, function (_c) {
                filteredPaths = paths.filter(function (path) { return path.start_date <= currentDay && path.end_date >= currentDay; });
                //remove old paths
                //except the image layer
                (_a = mapInstanceRef.current) === null || _a === void 0 ? void 0 : _a.getLayers().forEach(function (layer) {
                    var _a;
                    if (layer instanceof layer_1.Vector) {
                        if (layer.getSource() !== imageVectorSource.current) {
                            (_a = mapInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeLayer(layer);
                        }
                    }
                });
                _loop_1 = function (path) {
                    try {
                        var kmlSource = new source_1.Vector({
                            url: process.env.NEXT_PUBLIC_STATIC_KML_URL + "/" + path.kml_file,
                            format: new format_1.KML({
                                extractStyles: false
                            })
                        });
                        //iterate through all the features and add them to the map
                        kmlSource.on('addfeature', function (event) {
                            var feature = event.feature;
                            if (!feature) {
                                return;
                            }
                            //@ts-ignore
                            var id = feature.ol_uid || feature.getId();
                            if (!id) {
                                console.error('Feature ID is null');
                                return;
                            }
                            //pathFromFeature.current.set(id, path.id);
                            //set id, path.id
                            pathFromFeature.current[id] = path.id;
                        });
                        // Apply styles
                        var style = new style_1.Style({
                            stroke: new style_1.Stroke({
                                color: [path.color_r, path.color_g, path.color_b, 1],
                                width: path.thickness,
                                lineDash: path.style === 'dashed'
                                    ? [4, 8]
                                    : path.style === 'dotted'
                                        ? [1, 4]
                                        : path.style === 'solid'
                                            ? []
                                            : undefined
                            })
                        });
                        if (!kmlSource) {
                            console.error('kmlSource is null');
                            return { value: void 0 };
                        }
                        // Add the KML source to the map
                        // Assuming you have a map instance
                        (_b = mapInstanceRef.current) === null || _b === void 0 ? void 0 : _b.addLayer(new layer_1.Vector({
                            source: kmlSource,
                            style: style
                        }));
                    }
                    catch (err) {
                        console.error(err);
                    }
                };
                for (_i = 0, filteredPaths_1 = filteredPaths; _i < filteredPaths_1.length; _i++) {
                    path = filteredPaths_1[_i];
                    state_1 = _loop_1(path);
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                }
                return [2 /*return*/];
            });
        }); };
        fetchKMLFiles();
    }, [selected_date, tripsState.data, pathState.data]);
    // What is this for??
    (_c = mapInstanceRef.current) === null || _c === void 0 ? void 0 : _c.on('click', function (event) {
        var _a;
        //get the feature at the clicked location
        var feature = (_a = mapInstanceRef.current) === null || _a === void 0 ? void 0 : _a.forEachFeatureAtPixel(event.pixel, function (feature) { return feature; });
        if (feature) {
            //show the modal
            //set the path to the selected path
            //set the modal to open
            var paths = pathState.data;
            if (!paths)
                return;
            //get the feature id
            //@ts-ignore
            var featureId = feature.ol_uid || feature.getId();
            //get the path id from the feature
            var pathId_1 = pathFromFeature.current[featureId];
            //find it in the trip.paths
            if (!paths)
                return;
            var path = paths.find(function (p) { return p.id === pathId_1; });
            if (!path) {
                console.error('Path not found');
                return;
            }
            setPathModalSelected(path);
            setPathModalPosition({
                x: event.pixel[0],
                y: event.pixel[1]
            });
            console.log('Path:', path);
        }
    });
    //Add Heat Map Layer
    react_1.useEffect(function () {
        var _a, _b, _c;
        //create imageVectorSource based on the current day
        var tempImageVectorSource = new source_1.Vector();
        //Remember - this vector source doesn't need to be displayed, its only for
        //the heatmap for the day
        var trip = tripsState.data;
        var images = imageState.data;
        //remove old imageHeatMapLayer
        if (imageHeatMapLayer.current) {
            (_a = mapInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeLayer(imageHeatMapLayer.current);
        }
        imageHeatMapLayer.current = null;
        //check if heatmap is enabled
        //add images for that day to the vector source
        if (!images || !currentDay || !trip)
            return;
        images
            //.filter((i) => i.created_at.split('T')[0] === currentDay)
            .forEach(function (image) {
            var feature = new ol_1.Feature({
                geometry: new geom_1.Point(proj_1.fromLonLat([parseFloat(image.long), parseFloat(image.lat)])),
                ol_uid: image.id,
                id: image.id,
                Id: image.id
            });
            tempImageVectorSource.addFeature(feature);
        });
        console.log('Heat Map Images Length', tempImageVectorSource.getFeatures().length);
        imageHeatMapLayer.current = new layer_2.Heatmap({
            source: tempImageVectorSource,
            radius: 5,
            blur: 12,
            weight: function (feature) {
                return 1;
            }
        });
        //check if mapInstanceRef is populated
        if (!mapInstanceRef.current) {
            console.log('AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
        }
        if (!imageHeatMapLayer.current) {
            console.log('AAHSDSDOIJOIJOSD');
        }
        //check features in imageHeatMapLayer
        console.log('Heat Map Images Length', (_b = 
        //@ts-ignore
        imageHeatMapLayer.current) === null || _b === void 0 ? void 0 : _b.getSource().getFeatures().length);
        //add to map
        (_c = mapInstanceRef.current) === null || _c === void 0 ? void 0 : _c.addLayer(imageHeatMapLayer.current);
    }, [
        currentDay,
        tripsState.data,
        imageState.data,
        image_heat_map,
        selected_date,
    ]);
    //set center of view when the selected date changes
    react_1.useEffect(function () {
        var _a, _b, _c;
        //check if "zoom_on_day_change" is true
        if (!zoom_on_day_change) {
            return;
        }
        var trip = tripsState.data;
        var images = imageState.data;
        if (!trip || !currentDay)
            return;
        var startDate = new Date(trip.start_date);
        var selectedDate = new Date(startDate);
        selectedDate.setDate(startDate.getDate() + selected_date);
        //get images for the day
        var imagesForDay = get_images_for_day(selected_date, ((_a = tripsState.data) === null || _a === void 0 ? void 0 : _a.start_date) || '1970-01-01', imageState.data || []);
        if (imagesForDay.length > 0) {
            //set center of view to the center of the images
            var candidateImages = imagesForDay
                .filter(function (image) { return image.lat && image.long; })
                .filter(function (image) { return parseFloat(image.lat) !== 0 && parseFloat(image.long) !== 0; });
            var total_lat = candidateImages.reduce(function (acc, image) { return acc + parseFloat(image.lat); }, 0);
            var total_long = candidateImages.reduce(function (acc, image) { return acc + parseFloat(image.long); }, 0);
            //set the center of the map to the center of the trip
            (_b = mapInstanceRef.current) === null || _b === void 0 ? void 0 : _b.getView().setCenter(proj_1.fromLonLat([
                total_long / candidateImages.length,
                total_lat / candidateImages.length,
            ]));
            //set zoom level based on the size of the box
            // max_lat, min_lat, max_long, min_long
            var max_lat = candidateImages.reduce(function (acc, image) { return Math.max(acc, parseFloat(image.lat)); }, -Infinity);
            var min_lat = candidateImages.reduce(function (acc, image) { return Math.min(acc, parseFloat(image.lat)); }, Infinity);
            var max_long = candidateImages.reduce(function (acc, image) { return Math.max(acc, parseFloat(image.long)); }, -Infinity);
            var min_long = candidateImages.reduce(function (acc, image) { return Math.min(acc, parseFloat(image.long)); }, Infinity);
            var lat_diff = max_lat - min_lat;
            var long_diff = max_long - min_long;
            var max_diff = Math.max(lat_diff, long_diff);
            var zoom = Math.floor(9 - Math.log2(max_diff));
            (_c = mapInstanceRef.current) === null || _c === void 0 ? void 0 : _c.getView().setZoom(Math.min(zoom, 18));
        }
        // change heat map layer
        if (imageHeatMapLayer.current) {
            //mapInstanceRef.current?.removeLayer(imageHeatMapLayer.current);
        }
    }, [
        selected_date,
        tripsState.data,
        imageState.data,
        currentDay,
        zoom_on_day_change,
        get_images_for_day,
    ]);
    //if map is not open, return null
    if (!map_open) {
        return null;
    }
    //check if any are usLoading
    if (tripsState.isLoading || pathState.isLoading || imageState.isLoading) {
        return react_1["default"].createElement("div", null, "Loading...");
    }
    //check errors individually
    if (tripsState.error) {
        return react_1["default"].createElement("div", null,
            "Error: ",
            tripsState.error.message);
    }
    if (pathState.error) {
        return react_1["default"].createElement("div", null,
            "Error: ",
            pathState.error.message);
    }
    if (imageState.error) {
        return react_1["default"].createElement("div", null,
            "Error: ",
            imageState.error.message);
    }
    return (react_1["default"].createElement("div", { className: "flex justify-center items-center" },
        react_1["default"].createElement("div", { ref: mapRef, style: { width: '100%', height: "" + height }, className: "w-full relative " },
            react_1["default"].createElement(PathLegend_1["default"], { paths: selected_date && tripsState.data
                    ? (pathState.data &&
                        pathState.data.filter(function (path) {
                            return path.start_date <= currentDay &&
                                path.end_date >= currentDay;
                        })) ||
                        []
                    : [] }))));
}
exports["default"] = MapComponent;
