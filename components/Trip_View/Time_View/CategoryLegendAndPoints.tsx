//this component will take in a reference to a open layer map and render a legend and a convex hull

import { Feature, Map } from 'ol';
import {
  useTripViewStore,
  tripViewStore,
  useQueryTripImages,
  useQueryTrip,
} from '../Trip_View_Image_Store';
import VectorLayer from 'ol/layer/Vector';

import './CategoryLegend.css';

import { dateFromString } from '@/components/Trip_View/Time_Functions';

import {
  useRef,
  useMemo,
  useContext,
  use,
  useEffect,
  MutableRefObject,
  useState,
} from 'react';

import TripContext from '@/components/TripContext';
import { fromLonLat } from 'ol/proj';
import { Point, Polygon } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import * as turf from '@turf/turf';
import { Fill, Stroke, Style } from 'ol/style';
import VectorSource from 'ol/source/Vector';

//magnifying glass
import { FaSearchPlus } from 'react-icons/fa';
import CircleStyle from 'ol/style/Circle';

type CategoryLegendProps = {
  map: Map;
  convexHullLayer: MutableRefObject<VectorLayer | null>;
  addSource: (source: VectorSource) => void;
};

const colored_index: string[] = [
  `rgb(128,0,128)`, // Purple
  `rgb(0,0,139)`, // Deep Blue
  `rgb(139,69,19)`, // Saddle Brown
  `rgb(75,0,130)`, // Indigo
  `rgb(255,69,0)`, // Red-Orange
  `rgb(85,107,47)`, // Dark Olive Green
  `rgb(139,0,0)`, // Dark Red
  `rgb(0,100,0)`, // Dark Green
  `rgb(72,61,139)`, // Dark Slate Blue
  `rgb(128,0,0)`, // Maroon
  `rgb(0,0,128)`, // Navy
  `rgb(139,0,139)`, // Dark Magenta
  `rgb(0,139,139)`, // Dark Cyan
  `rgb(184,134,11)`, // Dark Goldenrod
  `rgb(85,107,47)`, // Dark Olive Green
  `rgb(128,0,0)`, // Maroon
  `rgb(0,100,0)`, // Dark Green
  `rgb(72,61,139)`, // Dark Slate Blue
  `rgb(139,0,139)`, // Dark Magenta
  `rgb(0,139,139)`, // Dark Cyan
  `rgb(0,0,128)`, // Navy
  `rgb(255,140,0)`, // Dark Orange
  `rgb(165,42,42)`, // Brown
];

const CategoryLegendAndPoints: React.FC<CategoryLegendProps> = ({
  map,
  //convexHullLayer,

  addSource,
}) => {
  const { filtered_categories, filtering_images, selected_date } =
    useTripViewStore();

  const { id } = useContext(TripContext);

  const [zoom, setZoom] = useState<number>(0);

  //ref to vector Layer for convex hull
  //const convexHullLayer = useRef<VectorLayer | null>(null);

  const convexHullSource = useRef<VectorSource>(new VectorSource());

  const tripsState = useQueryTrip(id);

  const imagesState = useQueryTripImages(id);

  //every 3 seconds, set zoom if it has changed
  useEffect(() => {
    const previous_zoom = map?.getView().getZoom();

    setInterval(() => {
      const current_zoom = map?.getView().getZoom();
      if (previous_zoom !== current_zoom) {
        setZoom(current_zoom || 0);
      }
    }, 3000);
  }, [map]);

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

  // get the categories relevant to the day and filter o
  const categories: string[] = useMemo(() => {
    //return [];
    const categoryies = tripsState.data?.categories || [];

    const relevant_categories = categoryies
      .filter((category) => {
        const start_date = dateFromString(category.start_date);
        const end_date = dateFromString(category.end_date);

        const current_day = dateFromString(currentDay);

        return current_day >= start_date && current_day <= end_date;
      })
      //and make sure they are not selected in selected_categories
      .filter((category) => {
        return !filtered_categories.includes(category.category);
      });

    return relevant_categories.map((category) => category.category);
  }, [currentDay, tripsState.data, filtered_categories]);

  // colored categories
  const coloredCategories: CategoryLegendComponentProps = useMemo(() => {
    const categorical = categories.map((category, i) => {
      const color = colored_index[i % colored_index.length];

      return {
        category,
        color,
      };
    });

    return {
      zoom_to_category: (category: string) => {},
      categories: categorical,
    };
  }, [categories]);

  // Draw a Convex Hull with a margin, first clearing the previous convex hull
  useEffect(() => {
    if (!map) return;

    if (!filtering_images) {
      //set an empty vector source
      convexHullSource.current.clear();
      addSource(convexHullSource.current);
    }

    //clear the previous convex hull
    convexHullSource.current.clear();

    //create points from relevant images for each category
    coloredCategories.categories.forEach((category) => {
      // get related images
      const images_filtered = imagesState.data?.filter((image) => {
        return image.category === category.category;
      });

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
      const points: Coordinate[] = images_filtered
        .map((image) => {
          return [parseFloat(image.long), parseFloat(image.lat)];
        })
        .filter((point) => {
          return point[0] != 0 || point[1] != 0;
        });

      //get extent of the map
      const extent = map.getView().calculateExtent(map.getSize());

      //calculate if the [max(w)-min(w), max(h)-min(h)] of the points is less than 10% of the extent

      const transformed_points = points.map((point) => {
        return fromLonLat(point);
      });

      const max_lon = Math.max(
        ...transformed_points.map((point) => {
          return point[0];
        })
      );

      const min_lon = Math.min(
        ...transformed_points.map((point) => {
          return point[0];
        })
      );

      const max_lat = Math.max(
        ...transformed_points.map((point) => {
          return point[1];
        })
      );

      const min_lat = Math.min(
        ...transformed_points.map((point) => {
          return point[1];
        })
      );

      const max_diff = Math.max(max_lon - min_lon, max_lat - min_lat);

      const max_extent = Math.max(extent[2] - extent[0], extent[3] - extent[1]);

      let too_small = false;

      console.log('category', category.category);
      console.log('max_diff', max_diff);
      console.log('max_extent', max_extent);
      console.log('#points', points.length);

      //if the max_diff is less than 10% of the extent, then don't draw the convex hull
      if (max_diff < 0.1 * max_extent) {
        too_small = true;
      }

      //if length is less than 2 - draw a circle
      if (points.length == 1 || too_small) {
        //draw a circle around point with the color of the category

        const new_feature = new Feature({
          geometry: new Point(fromLonLat(points[0])),
        });

        //Draw the Point with a color circle that is not filled in around it
        new_feature.setStyle(
          new Style({
            fill: new Fill({
              color: `${category.color}`,
            }),
            stroke: new Stroke({
              color: category.color,
              width: 5,
            }),
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: category.color,
              }),
            }),
          })
        );

        convexHullSource.current.addFeature(new_feature);
      }

      // draw convex hull with margin and color for each category
      if (points.length == 2 && !too_small) {
        //just draw 2 circles
        console.log('drawing 2 circles');

        const point1 = fromLonLat(points[0]);

        const point2 = fromLonLat(points[1]);

        const feature1 = new Feature({
          geometry: new Point(point1),
        });

        feature1.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({
                color: category.color,
              }),
              stroke: new Stroke({
                color: category.color,
                width: 2,
              }),
            }),
          })
        );

        // Draw the second point
        const feature2 = new Feature({
          geometry: new Point(point2),
        });

        feature2.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({
                color: category.color,
              }),
              stroke: new Stroke({
                color: category.color,
                width: 2,
              }),
            }),
          })
        );

        //add the features to the source
        convexHullSource.current.addFeature(feature1);

        convexHullSource.current.addFeature(feature2);

        //draw a turf circle around the two points
        /*const center = turf.center(turf.points(points));

        if (!center) return;

        const radius_in_km = max_diff / 2 / 1000;

        const buffered = turf.buffer(center, radius_in_km, {
          units: 'kilometers',
        });

        if (!buffered) return;

        //use fromLonLat to transform the coordinates
        const transformed_coordinates = buffered.geometry.coordinates[0].map(
          (point) => {
            //@ts-ignore
            return fromLonLat([point[0], point[1]]);
          }
        );

        const polygonFeature = new Feature({
          geometry: new Polygon([
            transformed_coordinates,
            //buffered.geometry.coordinates[0] as Coordinate[],
          ]),
        });

        //set the color of the polygon
        polygonFeature.setStyle(
          new Style({
            fill: new Fill({
              color: category.color,
            }),
            stroke: new Stroke({
              color: category.color,
              width: 8,
            }),
          })
        );
        */

        //add the feature to the source
        //convexHullSource.current.addFeature(polygonFeature);
      }

      if (points.length > 2 && !too_small) {
        //draw convex hull
        const hull = turf.convex(turf.points(points));

        if (hull) {
          const buffered_hull = turf.buffer(hull, 0.01, {
            units: 'kilometers',
          });

          if (!buffered_hull) return;

          //transform the coordinates to EPSG:3857
          const transformed_coordinates =
            buffered_hull.geometry.coordinates[0].map((point) => {
              //@ts-ignore
              return fromLonLat([point[0], point[1]]);
            });

          const polygonFeature = new Feature({
            geometry: new Polygon([
              transformed_coordinates,
              //buffered_hull.geometry.coordinates[0] as Coordinate[],
            ]),
          });

          //set the color of the polygon
          polygonFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: category.color,
                width: 8,
              }),
            })
          );
          convexHullSource.current.addFeature(polygonFeature);
          //print coordinates of the convex hull

          //@ts-ignore
          //convexHullLayer.current?.getSource().addFeature(polygonFeature);
        }
      }
    });

    //add the convex hull layer to the map
    addSource(convexHullSource.current);

    //draw convex hull
  }, [
    addSource,
    coloredCategories.categories,
    filtered_categories,
    filtering_images,
    imagesState.data,
    map,
    selected_date,
    zoom,
  ]);

  if (!filtering_images) {
    return null;
  }

  //zoom to category
  const zoom_to_category = (category: string) => {
    //get the images for the category
    const images_category = imagesState.data?.filter((image) => {
      return image.category === category;
    });

    if (!images_category) {
      return;
    }

    //filter out images with 0,0 coordinates
    const images = images_category.filter((image) => {
      return image.lat != '0' && image.long != '0';
    });

    //get the coordinates for the images
    const coordinates = images.map((image) => {
      return [parseFloat(image.long), parseFloat(image.lat)];
    });

    //get the center of the coordinates
    const center = turf.center(turf.points(coordinates));

    if (!center) {
      return;
    }

    //get the max of {lon_max-lon_min, lat_max-lat_min}
    const max_lon = Math.max(
      ...coordinates.map((coordinate) => {
        return coordinate[0];
      })
    );

    const min_lon = Math.min(
      ...coordinates.map((coordinate) => {
        return coordinate[0];
      })
    );

    const max_lat = Math.max(
      ...coordinates.map((coordinate) => {
        return coordinate[1];
      })
    );

    const min_lat = Math.min(
      ...coordinates.map((coordinate) => {
        return coordinate[1];
      })
    );

    const l = 's';
    const max_diff = Math.max(max_lon - min_lon, max_lat - min_lat);

    //determine zoom level based on max_diff
    // and center the map on the center of the coordinates
    const zoom = 9 - Math.log2(Math.abs(max_diff));

    //zoom to the center
    map.getView().animate({
      center: fromLonLat(center.geometry.coordinates as Coordinate),
      zoom,
      duration: 2000,
    });
  };

  //add the category legend component to the map

  return (
    <CategoryLegendComponent
      categories={coloredCategories.categories}
      zoom_to_category={zoom_to_category}
    />
  );
};

type CategoryColored = {
  category: string;
  color: string;
};

type CategoryLegendComponentProps = {
  categories: CategoryColored[];
  zoom_to_category: (category: string) => void;
};

const CategoryLegendComponent: React.FC<CategoryLegendComponentProps> = ({
  categories,
  zoom_to_category,
}) => {
  return (
    <div className="absolute top-0 left-0 m-4 p-4 bg-white bg-opacity-75 rounded-lg shadow-lg w-1/3">
      <h3 className="text-xl font-semibold mb-2">Categories</h3>

      <ul>
        {categories.map((category) => (
          <li key={category.category} className="flex items-center mb-2">
            <span
              className="category-legend-color w-4 h-4 inline-block mr-2"
              style={{ backgroundColor: category.color }}
            ></span>
            {category.category}
            <span>
              <FaSearchPlus
                className="ml-2"
                onClick={() => zoom_to_category(category.category)}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryLegendAndPoints;
