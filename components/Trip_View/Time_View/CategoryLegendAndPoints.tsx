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

type CategoryLegendProps = {
  map: Map;
  convexHullLayer: MutableRefObject<VectorLayer | null>;
  addSource: (source: VectorSource) => void;
};

const colored_index: string[] = [
  `rgb(255,0,0)`,
  `rgb(0,255,0)`,
  `rgb(0,0,255)`,
  `rgb(255,255,0)`,
  `rgb(0,255,255)`,
  `rgb(255,0,255)`,
  `rgb(255,255,255)`,
  `rgb(0,0,0)`,
  `rgb(128,128,128)`,
  `rgb(128,0,0)`,
  `rgb(128,128,0)`,
  `rgb(0,128,0)`,
  `rgb(128,0,128)`,
  `rgb(0,128,128)`,
  `rgb(0,0,128)`,
  `rgb(192,192,192)`,
  `rgb(128,128,128)`,
  `rgb(128,0,0)`,
  `rgb(128,128,0)`,
  `rgb(0,128,0)`,
  `rgb(128,0,128)`,
  `rgb(0,128,128)`,
  `rgb(0,0,128)`,
];

const CategoryLegendAndPoints: React.FC<CategoryLegendProps> = ({
  map,
  //convexHullLayer,

  addSource,
}) => {
  const { filtered_categories, filtering_images, selected_date } =
    useTripViewStore();

  const { id } = useContext(TripContext);

  //ref to vector Layer for convex hull
  //const convexHullLayer = useRef<VectorLayer | null>(null);

  const convexHullSource = useRef<VectorSource>(new VectorSource());

  const tripsState = useQueryTrip(id);

  const imagesState = useQueryTripImages(id);

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
    console.log('Updating Colored Categories', categorical);
    return {
      zoom_to_category: (category: string) => {},
      categories: categorical,
    };
  }, [categories]);

  // Draw a Convex Hull with a margin, first clearing the previous convex hull
  useEffect(() => {
    console.log('Drawing Convex Hull');

    if (!map) return;

    if (!filtering_images) {
      //set an empty vector source
      convexHullSource.current.clear();
      addSource(convexHullSource.current);
    }

    //add a random square with black border around [20,50] [30,50], [30,60], [20,60]
    const square = new Feature({
      geometry: new Polygon([
        [
          fromLonLat([20, 50]),
          fromLonLat([30, 50]),
          fromLonLat([30, 60]),
          fromLonLat([20, 60]),
          fromLonLat([20, 50]),
        ],
      ]),
    });

    //add to the source
    square.setStyle(
      new Style({
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
        stroke: new Stroke({
          color: 'rgba(0,0,0,1)',
          width: 10,
        }),
      })
    );

    //clear the previous convex hull
    convexHullSource.current.clear();

    convexHullSource.current.addFeature(square);

    //create points from relevant images for each category
    coloredCategories.categories.forEach((category) => {
      console.log('Convex Hull Category', category.category);
      // get related images
      const images_filtered = imagesState.data?.filter((image) => {
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
      const points: Coordinate[] = images_filtered
        .map((image) => {
          return [parseFloat(image.long), parseFloat(image.lat)];
        })
        .filter((point) => {
          return point[0] != 0 || point[1] != 0;
        });

      console.log('New Convex Hull Points', points);

      //if length is less than 2 - draw a circle
      if (points.length == 1) {
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
          })
        );
      }

      // draw convex hull with margin and color for each category
      if (points.length == 2) {
        //draw a turf circle around the two points
        const center = turf.center(turf.points(points));

        if (!center) return;

        const buffered = turf.buffer(center, 0.01, {
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
            buffered.geometry.coordinates[0] as Coordinate[],
          ]),
        });

        //set the color of the polygon
        polygonFeature.setStyle(
          new Style({
            fill: new Fill({
              color: category.color,
            }),
          })
        );
      }

      if (points.length > 2) {
        console.log('Creating convex hull for category', category.category);

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
          console.log(
            'Convex Hull Coordinates',
            polygonFeature.getGeometry()?.getExtent()
          );

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
  const zoom_to_category = (category: string) => {
    console.log('Zoom to Category', category);

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
  console.log('Categories for legend', categories);

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