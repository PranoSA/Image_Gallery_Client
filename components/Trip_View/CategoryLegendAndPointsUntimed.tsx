//this component will take in a reference to a open layer map and render a legend and a convex hull

import { Feature, Map } from 'ol';
import {
  useTripViewStore,
  tripViewStore,
  useQueryTripImages,
  useQueryTrip,
} from '@/components/Trip_View/Trip_View_Image_Store';
import VectorLayer from 'ol/layer/Vector';

import '@/components/Trip_View/Time_View/CategoryLegend.css';

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
  addSource: (source: VectorSource) => void;
};

const colored_index: string[] = [
  `rgb(128,0,128)`, // Purple
  `rgb(0,0,255)`, // Blue
  `rgb(210,105,30)`, // Chocolate
  `rgb(75,0,130)`, // Indigo
  `rgb(255,69,0)`, // Red-Orange
  `rgb(34,139,34)`, // Forest Green
  `rgb(255,0,0)`, // Red
  `rgb(0,128,0)`, // Green
  `rgb(106,90,205)`, // Slate Blue
  `rgb(128,0,0)`, // Maroon
  `rgb(0,0,128)`, // Navy
  `rgb(255,0,255)`, // Magenta
  `rgb(0,255,255)`, // Cyan
  `rgb(218,165,32)`, // Goldenrod
  `rgb(85,107,47)`, // Dark Olive Green
  `rgb(255,165,0)`, // Orange
  `rgb(255,20,147)`, // Deep Pink
  `rgb(0,255,0)`, // Lime
  `rgb(255,215,0)`, // Gold
  `rgb(0,191,255)`, // Deep Sky Blue
  `rgb(255,140,0)`, // Dark Orange
  `rgb(165,42,42)`, // Brown
];

const CategoryLegendAndPointsUntimed: React.FC<CategoryLegendProps> = ({
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

      //here -> Find out how many images are in the category within the extent
      const images_in_extent = images_filtered.filter((image) => {
        const point = fromLonLat([
          parseFloat(image.long),
          parseFloat(image.lat),
        ]);
        return (
          point[0] >= extent[0] &&
          point[0] <= extent[2] &&
          point[1] >= extent[1] &&
          point[1] <= extent[3]
        );
      });

      console.log('images in extent', images_in_extent.length);

      // what is a number too big maybe -> maybe 40?

      //In the future - maybe if there is more than 40 images -> Draw a Heat Map
      //or some other density representation

      //for now -> Just draw all the points as circles

      //maybe determine size based on# of points, like >40->3 pixels, >30 -> 4 pixels >20 -> 5 pixels, >10 -> 6 pixels, >5 -> 7 pixels, >1 -> 8 pixels
      let point_size = 3;
      if (images_in_extent.length > 40) {
        point_size = 3;
      } else if (images_in_extent.length > 30) {
        point_size = 4;
      } else if (images_in_extent.length > 20) {
        point_size = 5;
      } else if (images_in_extent.length > 10) {
        point_size = 6;
      } else if (images_in_extent.length > 5) {
        point_size = 7;
      } else if (images_in_extent.length > 1) {
        point_size = 8;
      } else {
        point_size = 9;
      }

      //draw the points
      points.forEach((point_untransformed) => {
        const point = fromLonLat(point_untransformed);

        const feature1 = new Feature({
          geometry: new Point(point),
        });

        feature1.setStyle(
          new Style({
            image: new CircleStyle({
              radius: point_size,
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
        //add the feature to the source
        convexHullSource.current.addFeature(feature1);
      });
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

    map.getView().setZoom(10);

    //zoom to the center
    map.getView().animate({
      center: fromLonLat(center.geometry.coordinates as Coordinate),
      zoom: 10,
      duration: 2000,
    });

    console.log('zoom', zoom);

    setTimeout(() => {
      map.getView().animate({
        center: fromLonLat(center.geometry.coordinates as Coordinate),
        zoom: Math.min(zoom, 17),
        duration: 2000,
      });
    }, 2000);

    //zoom to the center
    /*map.getView().animate({
      center: fromLonLat(center.geometry.coordinates as Coordinate),
      zoom,
      duration: 2000,
    });*/

    //set the zoom level
    setZoom(zoom);
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
    <div className="absolute top-10 left-0 m-4 p-4 bg-white bg-opacity-75 rounded-lg shadow-lg w-1/3 dark:bg-white">
      <ul>
        {categories.map((category) => (
          <li
            key={category.category}
            className="flex items-center mb-2 dark:text-black"
          >
            <span
              className="category-legend-color w-4 h-4 inline-block mr-2"
              style={{ backgroundColor: category.color }}
            ></span>
            {category.category}
            <span>
              <FaSearchPlus
                className="ml-2 dark:text-black"
                onClick={() => zoom_to_category(category.category)}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryLegendAndPointsUntimed;
