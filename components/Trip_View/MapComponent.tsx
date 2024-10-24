'use client';

/***
 *
 * The Map Component will draw in state from the store
 * and primarily from  the tanstack query
 *
 */

import PathLegend from '@/components/PathLegend';

import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';

//Open Layers
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
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

type MapProps = {
  height?: string;
};

export default function MapComponent<MapProps>({ height = '50vh' }) {
  //get td from context
  const { id } = useContext(TripContext);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //get the paths and loading state

  const tripsState = useQueryTrip(id);

  const pathState = useQueryTripPaths(id);

  const imageState = useQueryTripImages(id);

  const convexHullLayer = useRef<VectorLayer>(new VectorLayer());

  const [zoom, setZoom] = useState<number>(0);

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
    selecting_category,
    filtered_categories,
    filtering_images,
    scroll_to_image,
  } = useTripViewStore();

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
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
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
  }, [mapRef.current]);

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

    const current_zoom = mapInstanceRef.current.getView().getZoom();

    console.log('zooming in', current_zoom);

    //animate the map to the point
    mapInstanceRef.current.getView().animate({
      center: transformed_point,
      zoom: current_zoom,
      duration: 2000,
    });

    //mapInstanceRef.current.getView().setCenter(transformed_point);
  }, [scroll_to_image]);

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
          if (layer.getSource() === convexHullLayer.current.getSource()) {
          }
          if (
            layer.getSource() !== imageVectorSource.current &&
            layer.getSource() !== convexHullLayer.current.getSource()
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

  //set center of view when the selected date changes
  useEffect(() => {
    //check if "zoom_on_day_change" is true
    if (!zoom_on_day_change) {
      return;
    }

    const trip = tripsState.data;
    const images = imageState.data;
    if (!trip || !currentDay) return;

    const startDate = new Date(trip.start_date);
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + selected_date);

    //get images for the day
    const imagesForDay = get_images_for_day(
      selected_date,
      tripsState.data?.start_date || '1970-01-01',
      imageState.data || []
    );

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
    currentDay,
    zoom_on_day_change,
    get_images_for_day,
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

  const addVectorSourceToConvexHullLayer = (source: VectorSource) => {
    // remove old source
    convexHullLayer.current?.setSource(null);

    // remove layer from map
    if (convexHullLayer.current) {
      mapInstanceRef.current?.removeLayer(convexHullLayer.current);
    }

    // set new source
    convexHullLayer.current?.setSource(source);

    // add layer to map
    mapInstanceRef.current?.addLayer(convexHullLayer.current);

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
          <CategoryLegendAndPoints
            map={mapInstanceRef.current}
            convexHullLayer={convexHullLayer}
            addSource={addVectorSourceToConvexHullLayer}
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
