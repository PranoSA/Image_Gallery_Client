'use client';

/***
 *
 * The Map Component will draw in state from the store
 * and primarily from  the tanstack query
 *
 */
import '@/globals.css';

import PathLegend from '@/components/PathLegend';

import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';

//Open Layers
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { LineString, Point, Circle as CircleGeom } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { Heatmap } from 'ol/layer';
import { KML } from 'ol/format';

import { Image, Path } from '@/definitions/Trip_View';
// store and tanstack query
import {
  useQueryTrip,
  useQueryTripPaths,
  useQueryDaySummary,
  useQueryTripImages,
  useTripViewStore,
  tripViewStore,
} from './Trip_View_Image_Store';
import TripContext from '@/components/TripContext';
import { dateFromString } from './Time_Functions';

import CategoryLegendAndPoints from '@/components/Trip_View/Time_View/CategoryLegendAndPoints';
import CategoryLegendAndPointsUntimed from './CategoryLegendAndPointsUntimed';
import {
  CompareViewStore,
  useCompareViewStore,
} from './Compare_View/CompareStore';
import { Coordinate } from 'ol/coordinate';

type MapProps = {
  height?: string;
};

/**
 *
 * With Untimed Map Component, there should be no notion of "days"
 * You Are Filtering Purely By Category
 *
 * No Convex Hulls or Areas
 * Only "Categories" and Points within those categories that are color coded (instead of the colored convex hulls)
 *
 * I do not believe the MAP will ever NEED to know what the selected date is (untimed_trips_selected_date)
 * It will only use "selected categories"
 *
 * @param param0
 *
 *
 *
 * @returns
 */

export default function UntimedMapComponent<MapProps>({ height = '50vh' }) {
  //get td from context
  const { id } = useContext(TripContext);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //get the paths and loading state

  const tripsState = useQueryTrip(id);

  const pathState = useQueryTripPaths(id);

  const imageState = useQueryTripImages(id);

  const categoryImageLayer = useRef<VectorLayer>(new VectorLayer());

  const [zoom, setZoom] = useState<number>(0);

  //when map loads, add a click listener to the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    //add listener
    mapInstanceRef.current.on('click', (event) => {
      //get the feature at the clicked location
      const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      console.log('Feature', feature);

      if (feature) {
        //show the modal
        //set the path to the selected path
        //set the modal to open

        //see if there is an image at the clicked location
        const images = imageState.data;

        if (!images) return;

        const image = images.find((image) => {
          const point = [parseFloat(image.long), parseFloat(image.lat)];
          const transformed_point = fromLonLat(point);

          return (
            transformed_point[0] === event.coordinate[0] &&
            transformed_point[1] === event.coordinate[1]
          );
        });

        if (image) {
          CompareViewStore.setState((state) => {
            return { ...state, untimed_trips_selected_date: image.created_at };
          });

          //also set selected image location
          tripViewStore.setState((state) => {
            return { ...state, selected_image_location: image };
          });
        }
      }
    });
  }, [imageState.data]);

  //get information about the day, the image_location
  // for the purpose of filtering paths and stuff and mapopen
  const {
    selected_date,
    selected_image_location,
    map_open,
    get_images_for_day,
    zoom_on_day_change,
    image_heat_map,
    paths_open,
    scroll_to_image,
    photo_center_move_method,
  } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  //GOAL : Destroy every reference to "selected_date" and "untimed_trips_selected_date"
  // ANd to "currentDay" and "currentDayDate"
  const currentDay = useMemo<string>(() => {
    //selected_date is a number after the start date
    const start_date = tripsState.data?.start_date;

    if (!start_date) {
      return '1970-01-01';
    }

    const date = new Date(start_date);

    date.setDate(date.getDate() + selected_date);

    return date.toISOString().split('T')[0];
  }, [tripsState.data?.start_date, selected_date]);

  //Vector Source To Store Image Location, pretty much the "selected_image_location" corresponding data
  const imageVectorSource = useRef(new VectorSource());

  // javascript to find the path id from the feature
  const pathFromFeature = useRef<{ [key: string]: string }>({});

  //This is used to track the previous selected image (selected_image_location)
  // So that you can remove it when a new one is selected
  const selectedFeature = useRef<Feature | null>(null);

  // Image Heat Map Layer For The Map
  // Undecided if it should be for all images or just the images for the day
  const imageHeatMapLayer = useRef<Heatmap | null>(null);

  //add interactivity to the map

  // Quite a bnit confused what these are for
  const [pathModalSelected, setPathModalSelected] = useState<Path | null>(null);
  const [pathModalPosition, setPathModalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  // This is for when mapRef.current is loaded
  //and you need to set mapInstanceRef.current
  //which holds the actual map - the mapRef.current is the div target
  useEffect(() => {
    //check document is loaded - Don't run on the Serverside
    if (!document) {
      return;
    }

    if (mapRef.current && !mapInstanceRef.current) {
      const OSM_Layer = new TileLayer({
        source: new OSM(),
      });

      OSM_Layer.setZIndex(0);

      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          OSM_Layer,
          new VectorLayer({
            source: imageVectorSource.current,
            zIndex: 1000,
          }),
        ],
        view: new View({
          center: fromLonLat([2.3522, 48.8566]),
          zoom: 2,
        }),
      });

      //set scrollToImage function
    }
  }, []);

  const zoomLater = (image: Image) => {
    setTimeout(() => {
      const point = [parseFloat(image.long), parseFloat(image.lat)];
      const transformed_point = fromLonLat(point);

      if (!mapInstanceRef.current) return;
      const current_zoom = mapInstanceRef.current.getView().getZoom();

      console.log('zooming in', current_zoom);

      //if (!current_zoom) return;

      //const next_zoom = Math.max(current_zoom, Math.min(current_zoom + 3, 15));

      mapInstanceRef.current.getView().animate({
        center: transformed_point,
        zoom: 15,
        duration: 2000,
      });
    }, 2000);
  };

  const previousZoomCoordinate = useRef<Coordinate | null>(null);

  const flightPathVectorLayer = useRef<VectorLayer>();
  const flightPathVectorSource = useRef(new VectorSource());

  const previousSelectedImageLocation = useRef<Image | null>(null);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const image = scroll_to_image;

    if (!image) return;

    //scroll the map center to the scroll_to_image
    const point = [parseFloat(image.long), parseFloat(image.lat)];

    const transformed_point = fromLonLat(point);

    //return if the point is 0,0
    if (point[0] === 0 && point[1] === 0) {
      return;
    }

    //return if either is undefined
    if (!point[0] || !point[1]) {
      return;
    }

    //get distance from transformed_point to current center
    const current_center = mapInstanceRef.current.getView().getCenter();

    if (!current_center) return;

    const distance = Math.sqrt(
      (current_center[0] - transformed_point[0]) ** 2 +
        (current_center[1] - transformed_point[1]) ** 2
    );

    //this is the projected distance in meters (not actual distance)

    //  zoom -> 13 [the max distance is 20km]
    //  zoom -> 14 [the max distance is 10km]
    //  zoom -> 15 [the max distance is 3km]
    //  zoom -> 16 [the max distance is 1km]
    //  zoom -> 17 [the max distance is 500m]
    // 17 is the absolute maximum zoom
    // zoom -> 12 [the max distance is 40km]
    // zoom -> 11 [the max distance is 80km]
    // zoom -> 10 [the max distance is 160km]
    // zoom -> 9 [the max distance is 320km]
    // zoom -> 8 [the max distance is 640km]
    // zoom -> 7 [the max distance is 1280km]
    // zoom -> 6 [the max distance is 2560km]
    // zoom -> 5 [the max distance is 5120km]
    // zoom -> 4 [the max distance is 10240km]
    // zoom -> 3 [the max distance is 20480km] -- that is it

    //what is maximum distance on a globe? 20,000 km?
    // 20000/distance = 2^zoom
    // log2(20000/distance) = zoom
    // log2(20000/distance) = zoom
    const max_zoom = Math.ceil(Math.log2(60000000 / distance));

    //maybe make this a strict mathematical value in the future

    // make a "maximum zoom" depending on distance

    const previous_zoom = mapInstanceRef.current.getView().getZoom();

    const current_zoom = Math.min(
      mapInstanceRef.current.getView().getZoom() || 10,
      max_zoom
    );

    console.log('Current Zoom', current_zoom);
    console.log(
      'Acutal zoom of map',
      mapInstanceRef.current.getView().getZoom()
    );

    mapInstanceRef.current.getView().setZoom(current_zoom);

    if (photo_center_move_method === 'shift') {
      if (
        previousZoomCoordinate.current &&
        previousZoomCoordinate.current[0] === transformed_point[0] &&
        previousZoomCoordinate.current[1] === transformed_point[1]
      ) {
        mapInstanceRef.current.getView().animate({
          zoom: current_zoom + 4,
          duration: 1000,
          center: transformed_point,
        });
      } else {
        //animate the map to the point
        mapInstanceRef.current.getView().animate(
          {
            center: transformed_point,
            duration: 2000,
            zoom: Math.ceil(current_zoom),
          },
          {
            zoom: previous_zoom,
            duration: 2000,
            center: transformed_point,
          }
        );
      }

      previousZoomCoordinate.current = transformed_point;
    } else {
      const oldCenter = mapInstanceRef.current.getView().getCenter();
      const newCenter = transformed_point;
      const zoom_level = mapInstanceRef.current.getView().getZoom();

      if (!oldCenter) return;

      // Calculate the bounding box to fit both points
      const extent = [
        Math.min(oldCenter[0], newCenter[0]),
        Math.min(oldCenter[1], newCenter[1]),
        Math.max(oldCenter[0], newCenter[0]),
        Math.max(oldCenter[1], newCenter[1]),
      ];

      const view = mapInstanceRef.current.getView();

      //check if current extent is already in view
      const current_extent = view.calculateExtent(
        mapInstanceRef.current.getSize()
      );

      //if the current extent is already in view, zoom in
      const is_in_view =
        current_extent &&
        extent[0] > current_extent[0] &&
        extent[1] > current_extent[1] &&
        extent[2] < current_extent[2] &&
        extent[3] < current_extent[3];

      if (!is_in_view) {
        // Zoom out to fit both points
        view.fit(extent, {
          duration: 1000,
          padding: [50, 50, 50, 50],
        });
      }
      // Create a line feature between the old center and the new center
      const line = new LineString([oldCenter, newCenter]);
      const lineFeature = new Feature({
        geometry: line,
      });

      // Style for the line
      const lineStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
      });

      lineFeature.setStyle(lineStyle);

      // Animate the drawing of the line
      const duration = 2000;
      const start = Date.now();

      const map = mapInstanceRef.current;

      // Create a vector layer to display the line
      flightPathVectorSource.current.clear();
      flightPathVectorLayer.current = new VectorLayer({
        source: flightPathVectorSource.current,
      });

      flightPathVectorSource.current.addFeature(lineFeature);

      map.addLayer(flightPathVectorLayer.current);

      let reference_center = oldCenter;

      if (previousSelectedImageLocation.current) {
        reference_center = fromLonLat([
          parseFloat(previousSelectedImageLocation.current.long),
          parseFloat(previousSelectedImageLocation.current.lat),
        ]);
      }

      const arrowFeature = new Feature({
        geometry: new Point(newCenter),
      });
      //new ICON in the public folder "airplane-svgrepo-com.svg"

      /**
       *
       * angle of rotation
       *
       * for one, the rotation = 0 is really at 90 degrees (Due North)
       *
       * So take away PI/2 from the rotation
       *
       * here is how to get arc tan to work - because arctan ranges from -PI/2 to PI/2
       *
       * If its to the East (longitude of target is greater than longitude of reference)
       * Then the angle is arctan(long_diff/lat_diff) - PI/2
       *
       * If its to the West (longitude of target is less than longitude of reference)
       * Then the angle is arctan(long_diff/lat_diff) + PI/2
       *
       *
       */

      const angle_of_rotation =
        reference_center[0] < newCenter[0] //if the target is to the east
          ? Math.atan(
              (newCenter[1] - reference_center[1]) /
                (newCenter[0] - reference_center[0])
            ) -
            Math.PI / 2
          : Math.atan(
              //if the target is to the west
              (newCenter[1] - reference_center[1]) /
                (newCenter[0] - reference_center[0])
            ) +
            Math.PI / 2;

      console.log('Angle of Rotation THIRD', angle_of_rotation);

      const arrowStyle = new Style({
        image: new Icon({
          src: '/airplane-svgrepo-com.svg',
          scale: 0.05,
          rotateWithView: false,
          rotation: -angle_of_rotation,
        }),
      });

      arrowFeature.setStyle(arrowStyle);
      flightPathVectorSource.current.addFeature(arrowFeature);

      const animateLine = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        /* const currentPoint = [
          oldCenter[0] + (newCenter[0] - oldCenter[0]) * progress,
          oldCenter[1] + (newCenter[1] - oldCenter[1]) * progress,
        ];*/

        const currentPoint = [
          reference_center[0] + (newCenter[0] - reference_center[0]) * progress,
          reference_center[1] + (newCenter[1] - reference_center[1]) * progress,
        ];

        line.setCoordinates([reference_center, currentPoint]);
        arrowFeature.setGeometry(new Point(currentPoint));

        if (progress < 1) {
          setTimeout(animateLine, 25); // Roughly 60 frames per second
        } else {
          // Zoom to the new center after the line is drawn
          view.animate({
            center: newCenter,
            //zoom: previous_zoom,
            duration: 1000,
          });

          // Remove the line after the animation is complete
          setTimeout(() => {
            if (flightPathVectorLayer.current) {
              flightPathVectorSource.current.clear();
              map.removeLayer(flightPathVectorLayer.current);
            }
          }, 1000);
        }
      };

      animateLine();

      if (!mapInstanceRef.current) return;
      //mapInstanceRef.current.addLayer(flightPathVectorLayer.current);

      // Animate the drawing of the line using OpenLayers' built-in animation

      /*view.animate(
        {
          center: newCenter,
          zoom: previous_zoom,
          duration: 2000,
        },
        () => {
          if (!mapInstanceRef.current) return;
          // Remove the line after the animation is complete
          mapInstanceRef.current.removeLayer(vectorLayer);
        }
      );*/

      //requestAnimationFrame(animateLine);
    }

    //reset scroll to image
    tripViewStore.setState((state) => {
      return {
        ...state,
        scroll_to_image: null,
      };
    });

    previousSelectedImageLocation.current = image;

    //mapInstanceRef.current.getView().setCenter(transformed_point);
  }, [photo_center_move_method, scroll_to_image]);

  //use Effect that runs every 3 seconds and resets the zoom if the zoom has been changed

  //add marker for when selected_image_location changes
  // This places the marker on the map
  useEffect(() => {
    if (!selected_image_location) {
      //remove the marker
      if (selectedFeature.current) {
        imageVectorSource.current.removeFeature(selectedFeature.current);
        selectedFeature.current = null;
      }
      return;
    }

    if (selectedFeature.current?.get('id') === selected_image_location.id) {
      imageVectorSource.current.removeFeature(selectedFeature.current);
      //setSelectedImageLocation(null);
      selectedFeature.current = null;
    } else {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat([
            parseFloat(selected_image_location.long),
            parseFloat(selected_image_location.lat),
          ])
        ),
        ol_uid: selected_image_location.id,
        id: selected_image_location.id,
        Id: selected_image_location.id,
      });
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({
              color: 'black',
              width: 10,
            }),
          }),
        })
      );
      // Remove old feature
      if (selectedFeature.current) {
        imageVectorSource.current.removeFeature(selectedFeature.current);
      }
      selectedFeature.current = feature;
      imageVectorSource.current.addFeature(feature);
    }
  }, [selected_image_location]);

  //This renders the relevant paths on the map
  useEffect(() => {
    const trip = tripsState.data;
    const paths = pathState.data;

    if (!selected_date || !trip || !paths) return;
    const currentDayDate = new Date(trip.start_date);
    currentDayDate.setDate(currentDayDate.getDate() + selected_date);

    const currentDay = currentDayDate.toISOString().split('T')[0];
    if (!currentDay) return;

    const fetchKMLFiles = async () => {
      const filteredPaths = paths.filter(
        (path) => path.start_date <= currentDay && path.end_date >= currentDay
      );

      //remove old paths
      //except the image layer

      mapInstanceRef.current?.getLayers().forEach((layer) => {
        //remove all vector layers except the image layer

        if (layer instanceof VectorLayer) {
          //console log if finds convex hull layer
          if (layer.getSource() === categoryImageLayer.current.getSource()) {
          }
          if (
            layer.getSource() !== imageVectorSource.current &&
            layer.getSource() !== categoryImageLayer.current.getSource()
          ) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        }
      });

      if (!paths_open) {
        return;
      }

      for (const path of filteredPaths) {
        try {
          const kmlSource = new VectorSource({
            url: `${process.env.NEXT_PUBLIC_STATIC_KML_URL}/${path.kml_file}`,
            format: new KML({
              extractStyles: false,
            }),
          });

          //iterate through all the features and add them to the map
          kmlSource.on('addfeature', (event) => {
            const feature = event.feature;

            if (!feature) {
              return;
            }
            //@ts-ignore
            const id = feature.ol_uid || feature.getId();
            if (!id) {
              console.error('Feature ID is null');
              return;
            }

            //pathFromFeature.current.set(id, path.id);
            //set id, path.id
            pathFromFeature.current[id] = path.id;
          });

          // Apply styles
          const style = new Style({
            stroke: new Stroke({
              color: [path.color_r, path.color_g, path.color_b, 1], // RGBA array
              width: path.thickness,
              lineDash:
                path.style === 'dashed'
                  ? [4, 8]
                  : path.style === 'dotted'
                  ? [1, 4]
                  : path.style === 'solid'
                  ? []
                  : undefined,
            }),
          });

          if (!kmlSource) {
            console.error('kmlSource is null');
            return;
          }

          // Add the KML source to the map
          // Assuming you have a map instance

          mapInstanceRef.current?.addLayer(
            new VectorLayer({
              source: kmlSource,
              style: style,
            })
          );
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchKMLFiles();
  }, [selected_date, tripsState.data, pathState.data, paths_open]);

  //add listener
  mapInstanceRef.current?.on('click', (event) => {
    console.log('Map Clicked');
    //get the feature at the clicked location
    const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature
    );

    console.log('Feature', feature);

    if (feature) {
      //show the modal
      //set the path to the selected path
      //set the modal to open

      //see if there is an image at the clicked location
      const images = imageState.data;

      if (!images) return;

      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        console.log('feature geometry', geometry.getCoordinates());
      }

      if (!(geometry instanceof Point)) return;

      const coordinates = geometry.getCoordinates();

      const image = images.find((image) => {
        const point = [parseFloat(image.long), parseFloat(image.lat)];
        const transformed_point = fromLonLat(point);

        console.log('transformed_point', transformed_point);
        console.log('coordinates', coordinates);

        return (
          transformed_point[0] === coordinates[0] &&
          transformed_point[1] === coordinates[1]
        );

        return (
          transformed_point[0] === event.coordinate[0] &&
          transformed_point[1] === event.coordinate[1]
        );
      });

      console.log('image', image);

      if (image) {
        CompareViewStore.setState((state) => {
          return { ...state, untimed_trips_selected_date: image.created_at };
        });

        //also set selected image location
        tripViewStore.setState((state) => {
          return { ...state, selected_image_location: image };
        });
      }
    }
  });
  // What is this for??
  mapInstanceRef.current?.on('click', (event) => {
    //get the feature at the clicked location
    const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature
    );

    if (feature) {
      //show the modal
      //set the path to the selected path
      //set the modal to open
      const paths = pathState.data;
      if (!paths) return;

      //get the feature id

      //@ts-ignore
      const featureId = feature.ol_uid || feature.getId();

      //get the path id from the feature
      const pathId = pathFromFeature.current[featureId];

      //find it in the trip.paths
      if (!paths) return;
      const path = paths.find((p) => p.id === pathId);

      if (!path) {
        console.error('Path not found');
        return;
      }
      setPathModalSelected(path);
      setPathModalPosition({
        x: event.pixel[0],
        y: event.pixel[1],
      });
    }
  });

  //Add Heat Map Layer
  useEffect(() => {
    //create imageVectorSource based on the current day
    const tempImageVectorSource = new VectorSource();

    //Remember - this vector source doesn't need to be displayed, its only for
    //the heatmap for the day
    const trip = tripsState.data;
    const images = imageState.data;

    //remove old imageHeatMapLayer
    if (imageHeatMapLayer.current) {
      mapInstanceRef.current?.removeLayer(imageHeatMapLayer.current);
    }

    imageHeatMapLayer.current = null;

    //check if heatmap is enabled

    //add images for that day to the vector source
    if (!images || !currentDay || !trip) return;

    if (!image_heat_map) return;

    images
      .filter((i) => i.lat && i.long)
      .filter((i) => parseFloat(i.lat) !== 0 || parseFloat(i.long) !== 0)

      //.filter((i) => i.created_at.split('T')[0] === currentDay)
      .forEach((image) => {
        const feature = new Feature({
          geometry: new Point(
            fromLonLat([parseFloat(image.long), parseFloat(image.lat)])
          ),
          ol_uid: image.id,
          id: image.id,
          Id: image.id,
        });
        tempImageVectorSource.addFeature(feature);
      });

    imageHeatMapLayer.current = new Heatmap({
      source: tempImageVectorSource,
      radius: 5,
      blur: 12,
      weight: function (feature) {
        return 1;
      },
    });

    //add to map
    mapInstanceRef.current?.addLayer(imageHeatMapLayer.current);
  }, [
    currentDay,
    tripsState.data,
    imageState.data,
    image_heat_map,
    selected_date,
  ]);

  const animateDayChangeLayer = useRef<VectorLayer | null>(null);
  const animateDayChangeSource = useRef<VectorSource | null>(null);

  const previousDayCenter = useRef<Coordinate | null>(null);

  const untimed_trips_selcted_date_Day = useMemo(() => {
    return untimed_trips_selected_date.toDateString();
  }, [untimed_trips_selected_date]);

  //set center of view when the selected date changes
  useEffect(() => {
    //check if "zoom_on_day_change" is true
    if (!zoom_on_day_change) {
      return;
    }

    const trip = tripsState.data;
    const images = imageState.data;
    if (!trip || !images) return;

    //log all of the useEffect dependencies
    console.log('Useeffect Trip', trip);

    console.log('Useeffect Images', images);
    console.log('Useeffect Selected Date', selected_date);
    console.log(
      'Useeffect Untimed Trips Selected Date',
      untimed_trips_selcted_date_Day
    );
    console.log('Useeffect Zoom On Day Change', zoom_on_day_change);
    console.log('Useeffect --------------------------------------------');

    //get untimed_trips_selected_date

    //get images for the day
    const imagesForDay = images.filter((image) => {
      //check if same date as untimed_trips_selected_date
      //const image_date = new Date(image.created_at);
      //check if same DATE as untimed_trips_selected_date

      /*
         const images_today = images.filter((image) => {
        const image_date = new Date(image.created_at);

        console.log('Image Date', image_date.toDateString());
        console.log(
          'Selected Date',
          untimed_trips_selected_date.toDateString()
        );

        const AreEqual =
          image_date.toDateString() ===
          untimed_trips_selected_date.toDateString();
        console.log('Date are Equal', AreEqual);

        return AreEqual;

        return (
          image_date.toDateString() ===
          untimed_trips_selected_date.toDateString()
        );
      });

      console.log("Date's Images", images_today);

      return images_today;
      */
      const image_date = new Date(image.created_at);

      return image_date.toDateString() === untimed_trips_selcted_date_Day;
    });

    animateDayChangeSource.current?.clear();

    console.log('Images for Day', imagesForDay);

    if (imagesForDay.length > 0) {
      //set center of view to the center of the images
      const candidateImages = imagesForDay
        .filter((image) => image.lat && image.long)
        .filter(
          (image) => parseFloat(image.lat) !== 0 && parseFloat(image.long) !== 0
        );

      const total_lat = candidateImages.reduce(
        (acc, image) => acc + parseFloat(image.lat),
        0
      );

      const total_long = candidateImages.reduce(
        (acc, image) => acc + parseFloat(image.long),
        0
      );

      //if candidateImages is empty, return
      if (candidateImages.length === 0) return;

      const oldCenter = previousDayCenter.current
        ? previousDayCenter.current
        : mapInstanceRef.current?.getView().getCenter();

      const first_day_coordinates = fromLonLat([
        parseFloat(candidateImages[0].long),
        parseFloat(candidateImages[0].lat),
      ]);

      /*const newCenter = fromLonLat([
        total_long / candidateImages.length,
        total_lat / candidateImages.length,
      ]);*/

      const centerOfImages = fromLonLat([
        total_long / candidateImages.length,
        total_lat / candidateImages.length,
      ]);

      const newCenter = first_day_coordinates;

      if (oldCenter) {
        //draw a line and animate the map to the new center
        const line = new LineString([oldCenter, newCenter]);
        const lineFeature = new Feature({
          geometry: line,
        });

        //icon
        const arrowFeature = new Feature({
          geometry: new Point(newCenter),
        });

        const angle_of_rotation =
          oldCenter[0] < newCenter[0] //if the target is to the east
            ? Math.atan(
                (newCenter[1] - oldCenter[1]) / (newCenter[0] - oldCenter[0])
              ) -
              Math.PI / 2
            : Math.atan(
                //if the target is to the west
                (newCenter[1] - oldCenter[1]) / (newCenter[0] - oldCenter[0])
              ) +
              Math.PI / 2;

        console.log('Angle of Rotation', angle_of_rotation);

        const arrowStyle = new Style({
          image: new Icon({
            src: '/airplane-svgrepo-com.svg',
            scale: 0.05,
            rotateWithView: false,
            rotation: -angle_of_rotation,
          }),
        });

        arrowFeature.setStyle(arrowStyle);

        animateDayChangeSource.current?.addFeature(lineFeature);

        animateDayChangeSource.current?.addFeature(arrowFeature);

        //add to the map
        if (!animateDayChangeLayer.current) {
          animateDayChangeSource.current = new VectorSource();
          animateDayChangeLayer.current = new VectorLayer({
            source: animateDayChangeSource.current,
          });

          mapInstanceRef.current?.addLayer(animateDayChangeLayer.current);
        }

        // Animate the drawing of the line using OpenLayers' built-in animation
        const duration = 2000;

        const start = Date.now();

        // zoom out for extents with padding to include the old center and the new center
        const extent = [
          Math.min(oldCenter[0], newCenter[0]),
          Math.min(oldCenter[1], newCenter[1]),
          Math.max(oldCenter[0], newCenter[0]),
          Math.max(oldCenter[1], newCenter[1]),
        ];

        const view = mapInstanceRef.current?.getView();

        //check if current extent is already in view
        const current_extent = view?.calculateExtent(
          mapInstanceRef.current?.getSize()
        );

        //if the current extent is not in view, zoom to the extent
        const is_in_view =
          current_extent &&
          extent[0] > current_extent[0] &&
          extent[1] > current_extent[1] &&
          extent[2] < current_extent[2] &&
          extent[3] < current_extent[3];

        const previous_zoom = mapInstanceRef.current?.getView().getZoom();

        if (!is_in_view) {
          // Zoom out to fit both points
          view?.fit(extent, {
            duration: 1000,
            padding: [50, 50, 50, 50],
          });
        }

        const animateLine = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);

          const currentPoint = [
            oldCenter[0] + (newCenter[0] - oldCenter[0]) * progress,
            oldCenter[1] + (newCenter[1] - oldCenter[1]) * progress,
          ];

          line.setCoordinates([oldCenter, currentPoint]);
          arrowFeature.setGeometry(new Point(currentPoint));

          if (progress < 1) {
            setTimeout(animateLine, 25); // Roughly 60 frames per second
          } else {
            // Zoom to the new center after the line is drawn
            mapInstanceRef.current?.getView().animate({
              center: newCenter,
              zoom: previous_zoom,
              duration: 1000,
            });

            // Remove the line after the animation is complete
            setTimeout(() => {
              animateDayChangeSource.current?.clear();

              // GET 3857 extents of all the images

              const points: Coordinate[] = candidateImages.map((image) => {
                return fromLonLat([
                  parseFloat(image.long),
                  parseFloat(image.lat),
                ]);
              });

              const total_lat = points.reduce(
                (acc, point) => acc + point[1],
                0
              );

              const total_long = points.reduce(
                (acc, point) => acc + point[0],
                0
              );

              const center_of_images = [
                total_long / candidateImages.length,
                total_lat / candidateImages.length,
              ];

              const max_lat = points.reduce(
                (acc, point) => Math.max(acc, point[1]),
                -Infinity
              );

              const min_lat = points.reduce(
                (acc, point) => Math.min(acc, point[1]),
                Infinity
              );

              const max_long = points.reduce(
                (acc, point) => Math.max(acc, point[0]),
                -Infinity
              );

              const min_long = points.reduce(
                (acc, point) => Math.min(acc, point[0]),
                Infinity
              );

              const center = [
                (min_long + max_long) / 2,
                (min_lat + max_lat) / 2,
              ];

              //draw a light gray inscribing circle around the candidate images
              //add to animateDayChangeSource
              const circle = new CircleGeom(
                // centerOfImages,
                //center_of_images,
                center,
                Math.max(max_lat - min_lat, max_long - min_long)
              );
              const circleFeature = new Feature({
                geometry: circle,
              });

              //print extent of the circle
              console.log('Circle Extent', circle.getExtent());

              // Define the coordinates for the four corners
              /* const cornersFeature = new Feature({
                geometry: new LineString(corners),
              });

              // Style for the corners
              const cornersStyle = new Style({
                stroke: new Stroke({
                  color: 'red',
                  width: 4,
                }),
              });

              cornersFeature.setStyle(cornersStyle);

              animateDayChangeSource.current?.addFeature(cornersFeature);
*/
              // Style for the circle
              const circleStyle = new Style({
                fill: new Fill({
                  //color: 'blue',

                  color: 'rgba(211, 211, 211, 0.5)', // Light gray with 50% transparency
                }),
                stroke: new Stroke({
                  //color: 'blue',
                  color: 'rgba(211, 211, 211, 0.8)', // Light gray with 80% transparency
                  width: 10,
                }),
              });

              circleFeature.setStyle(circleStyle);

              // Add the circle feature to the source
              animateDayChangeSource.current?.addFeature(circleFeature);
              //add to layer
              animateDayChangeLayer.current?.setSource(
                animateDayChangeSource.current
              );
            }, 1000);
          }
        };

        animateLine();

        //previousDayCenter.current = newCenter;
        previousDayCenter.current = centerOfImages;

        //mapInstanceRef.current?.getView().setCenter(newCenter);

        //animate transition to new center
        /*mapInstanceRef.current
          ?.getView()
          .animate({ center: newCenter, duration: 2000 });
*/
        //animate zoom to just including the two point
        return;
      }

      //set the center of the map to the center of the trip
      mapInstanceRef.current
        ?.getView()
        .setCenter(
          fromLonLat([
            total_long / candidateImages.length,
            total_lat / candidateImages.length,
          ])
        );

      //set zoom level based on the size of the box
      // max_lat, min_lat, max_long, min_long

      const max_lat = candidateImages.reduce(
        (acc, image) => Math.max(acc, parseFloat(image.lat)),
        -Infinity
      );

      const min_lat = candidateImages.reduce(
        (acc, image) => Math.min(acc, parseFloat(image.lat)),
        Infinity
      );

      const max_long = candidateImages.reduce(
        (acc, image) => Math.max(acc, parseFloat(image.long)),
        -Infinity
      );

      const min_long = candidateImages.reduce(
        (acc, image) => Math.min(acc, parseFloat(image.long)),
        Infinity
      );

      const lat_diff = max_lat - min_lat;
      const long_diff = max_long - min_long;

      const max_diff = Math.max(lat_diff, long_diff);

      const zoom = Math.floor(9 - Math.log2(max_diff));

      mapInstanceRef.current?.getView().setZoom(Math.min(zoom, 18));
    }

    // change heat map layer
    if (imageHeatMapLayer.current) {
      //mapInstanceRef.current?.removeLayer(imageHeatMapLayer.current);
    }
  }, [
    selected_date,
    tripsState.data,
    imageState.data,
    zoom_on_day_change,
    untimed_trips_selcted_date_Day,
  ]);

  //if selecting category is true, show a legend on the bottom right of the map
  //pick random colors for each category, and then color the points based on the category
  //draw a convex hull with a margin of a few pixels, with the same color as the category

  //if map is not open, return null
  if (!map_open) {
    return null;
  }

  //check if any are usLoading
  if (tripsState.isLoading || pathState.isLoading || imageState.isLoading) {
    return <div>Loading...</div>;
  }

  //check errors individually
  if (tripsState.error) {
    return <div>Error: {tripsState.error.message}</div>;
  }

  if (pathState.error) {
    return <div>Error: {pathState.error.message}</div>;
  }

  if (imageState.error) {
    return <div>Error: {imageState.error.message}</div>;
  }

  const addVectorSourceToCategoryImageLayer = (source: VectorSource) => {
    // remove old source
    categoryImageLayer.current?.setSource(null);

    // remove layer from map
    if (categoryImageLayer.current) {
      mapInstanceRef.current?.removeLayer(categoryImageLayer.current);
    }

    // set new source
    categoryImageLayer.current?.setSource(source);

    // add layer to map
    mapInstanceRef.current?.addLayer(categoryImageLayer.current);

    //
  };

  return (
    <div className="flex justify-center items-center">
      {/* MapControlWidget */}
      <div
        ref={mapRef}
        style={{ width: '100%', height: `${height}` }} //'50vh' }}
        className="w-full relative "
      >
        {mapInstanceRef.current && (
          <CategoryLegendAndPointsUntimed
            map={mapInstanceRef.current}
            addSource={addVectorSourceToCategoryImageLayer}
          />
        )}

        <PathLegend
          paths={
            selected_date && tripsState.data
              ? (pathState.data &&
                  pathState.data.filter(
                    (path) =>
                      path.start_date <= currentDay &&
                      path.end_date >= currentDay
                  )) ||
                []
              : []
          }
        />
      </div>
    </div>
  );
}
