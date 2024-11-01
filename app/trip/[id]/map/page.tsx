'use client';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import Map from 'ol/Map';

import '@/globals.css';

import { TripDropdownMenu } from '@/components/Trip_View/TripDropdownOptions';

import { Banner_Component } from '@/components/Trip_View/Banner_Component';
import { Banner_Component as Banner_Component_Untimed } from '@/components/Trip_View/Compare_View/Untimed_Compare_View/Banner_Component';

import MapComponent from '@/components/Trip_View/MapComponent';
import UntimedMapComponent from '@/components/Trip_View/UntimedMapComponent';

import AddPathsForm from '@/components/Trip_View/AddPathsForm';
import axios from 'axios';
import NextImage from 'next/image';
import Modal from '@/components/PathModal';

import { KML } from 'ol/format';
import { HiOutlinePencil } from 'react-icons/hi';

import type { Image, Path, Trip, History } from '@/definitions/Trip_View';

import {
  useQueryTripPaths,
  useQueryTrip,
  useQueryTripImages,
} from '@/components/Trip_View/Trip_View_Image_Store';

import PathMapModal from '@/components/PathMapModal';

import {
  useTripViewStore,
  tripViewStore,
  queryClient,
} from '@/components/Trip_View/Trip_View_Image_Store';
import Image_View_ByDate from '@/components/Trip_View/Date_View/Image_View_ByDate';

import { QueryClientProvider } from '@tanstack/react-query';

import TripContext from '@/components/TripContext';
import SelectionComponentGallery from '@/components/Trip_View/SelectionComponentGallery';
import { Resizable } from 're-resizable';

import {
  useSession,
  UseSessionOptions,
  SessionProvider,
} from 'next-auth/react';
import { FaHome } from 'react-icons/fa';
import SideTab from '@/components/SideTab';
import { Coordinate } from 'ol/coordinate';
import { useCompareViewStore } from '@/components/Trip_View/Compare_View/CompareStore';
//process.env.NEXT_PUBLIC_API_URL

//create provider next-auth
//
const NextAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};

const useTripContext = () => {
  return useContext(TripContext);
};

interface TripProviderProps {
  children: React.ReactNode;
  id: string;
  bearer_token: string | null;
  setBearerToken: (token: string) => void;
  scrollToImage: (image: Image) => void;
}

const TripProvider = ({
  children,
  id,
  setBearerToken,
  scrollToImage,
}: TripProviderProps) => {
  return (
    <TripContext.Provider
      value={{ id, bearer_token: null, setBearerToken, scrollToImage }}
    >
      {children}
    </TripContext.Provider>
  );
};

const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const setBearerTokenCallback = (toke: string) => {
    setBearerToken(toke);
  };

  return (
    <TripProvider
      id={id || '0'}
      bearer_token={bearerToken}
      setBearerToken={setBearerToken}
      scrollToImage={(image: Image) => {}}
    >
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    </TripProvider>
  );
};

//wrap PageWithProvider with QueryClientProvider

export default PageWithProvider;

//function Page({ params: { id } }: { params: { id: string } }) {
function Page() {
  const { id, bearer_token, setBearerToken } = useTripContext();

  const screen_height =
    typeof window !== 'undefined' ? window.innerHeight : 1000;

  const [galleryHeight, setGalleryHeight] = useState(
    Math.min(400, screen_height / 2)
  ); // Initial height of the gallery
  const prevGalleryHeight = useRef<number>(galleryHeight);

  //width of the gallery

  //make a media query for 1/2 the screen width
  const screen_width = typeof window !== 'undefined' ? window.innerWidth : 1000;

  const [galleryWidth, setGalleryWidth] = useState(screen_width / 2); // Initial width of the gallery
  const prevGalleryWidth = useRef<number>(galleryWidth);

  const { data: session, update, status } = useSession();

  //set timeout that reads session.accessToken every 140 seconds
  //if it changes, then update the bearer token
  useEffect(() => {
    const interval = setInterval(() => {
      //store the access token in local storage
      if (session?.accessToken) {
        localStorage.removeItem('accessToken');
        localStorage.setItem('accessToken', session.accessToken);
      }
      setBearerToken(session?.accessToken || '');
      //set tripContext bearer token
    }, 140000);

    return () => clearInterval(interval);
  }, [session, setBearerToken]);

  useEffect(() => {
    //store the access token in local storage
    if (session?.accessToken) {
      localStorage.removeItem('accessToken');
      localStorage.setItem('accessToken', session.accessToken);
    }
    //setBearerToken(session?.accessToken || '');
    //set tripContext bearer token
  }, [session]);

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  // with trip paths
  const {
    data: paths,
    isLoading: pathsLoading,
    error: pathsError,
  } = useQueryTripPaths(id);

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(id);

  const {
    selected_date,
    get_images_for_day,
    selected_image_location,
    day_by_day_banners,
    horizontally_tabbed,
  } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  //use effect for dealing with history
  useEffect(() => {
    //Retreive History object from local storage
    const history = localStorage.getItem('history');

    if (!trip) return;

    //get last history object
    const lastHistory: History = JSON.parse(history || '[]')[0] || [];

    let is_new = true;

    //if history is either empty or the trip id and MAP type is not the same
    //then this is a new history, otherwise you'lll just update the history
    if (
      !lastHistory.tripId ||
      lastHistory.tripId !== id ||
      lastHistory.type !== 'mapWithTimeView'
    ) {
      is_new = true;
    } else {
      is_new = false;
    }

    //if is_new and the length is larger than 15, then remove the last element

    if (trip.untimed_trips) {
      if (is_new) {
        //add to history
        const newHistory: History = {
          tripId: id,
          type: 'mapWithTimeView',
          setZoom: null,
          setCenter: null,
          link: `/trip/${id}/map?untimed_trips_selected_date=${untimed_trips_selected_date}`,
          //selected_date: null,
          scrolled_date: untimed_trips_selected_date || new Date(),
        };

        //store the history in local storage
        localStorage.setItem(
          'history',
          JSON.stringify([newHistory, ...(JSON.parse(history || '[]') || [])])
        );
      }
    }
  }, [untimed_trips_selected_date, selected_date, trip, id]);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //populated on loading
  //const [trip, setTrip] = useState<Trip | null>(null);

  const [pathModalOpen, setPathModalOpen] = useState(false);

  const currentDay = () => {
    if (!trip) return '1970-01-01';
    const startDate = new Date(trip.start_date);
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + selected_date);

    return selectedDate.toISOString().split('T')[0];
  };

  const [comparingPhotos, setComparingPhotos] = useState<boolean>(false);

  const [menu, showMenu] = useState<boolean>(false);

  // map to find the path id from the feature
  //key value pair
  // it is not an Open Layer Map
  const pathFromFeature = useRef<{ [key: string]: string }>({});

  const imagesForDay: Image[] = useMemo(() => {
    return get_images_for_day(
      selected_date,
      trip?.start_date || '1970-01-01',
      images || []
    );
  }, [get_images_for_day, selected_date, trip?.start_date, images]);

  //add interactivity to the map

  const [pathModalSelected, setPathModalSelected] = useState<Path | null>(null);
  const [pathModalPosition, setPathModalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [center, setCenter] = useState<Coordinate | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);

  /**
   * useEff
   */

  //store computed Banner Component
  const bannerComponent = useMemo(() => {
    if (!trip) {
      return <div></div>;
    }

    if (trip.untimed_trips) {
      return <Banner_Component_Untimed />;
    }

    return <Banner_Component />;
  }, [trip]);

  // if selecting the path, then it shows a pop up modal

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

  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  const [doneSelectedImages, setDoneSelectedImages] = useState<boolean>(false);

  /**
   *
  This is for fields like name, description, created_at

   */
  const handleComparePhotosSelection = (image: Image) => {
    // Add Image to Selected Images
    // unless, it is already in the selected images

    const new_images = selectedImages.includes(image)
      ? selectedImages.filter((i) => i !== image)
      : [...selectedImages, image];

    setSelectedImages(new_images);
  };

  if (doneSelectedImages) {
    //This will show all the images in a larger gallery [say, the width of the screen]
    //Then show an X button above each image
    //when you click -> remove the image from the selected images
    // Send DELETE request to the API
    // /trip/:tripid/images/:id

    const handleDeleteImage = async (image: Image) => {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images/${image.id}`
        );
        setSelectedImages(selectedImages.filter((i) => i !== image));

        //also delete from trip.images

        if (!trip) return;
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    };

    return (
      <div className="flex flex-wrap space-around">
        {selectedImages.map((image) => (
          <div key={image.id} className="relative">
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              width={500}
              height={500}
            />
            <button className="" onClick={() => handleDeleteImage(image)}>
              X
            </button>
          </div>
        ))}
        <button
          onClick={() => setDoneSelectedImages(false)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Done Selecting Images
        </button>
      </div>
    );
  }

  if (comparingPhotos) {
    // Have the Image Gallery for that day instead of the map
    // select the images to compare
    // then click a "done button"
    // this sets doneSelectedImages to true
    return (
      <div className="">
        <div className="gallery mt-4">
          {imagesForDay.map((image: Image) => (
            <div key={image.id}>
              <HiOutlinePencil />
              <NextImage
                src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                alt={`Image for ${image.created_at}`}
                width={100}
                height={100}
                onClick={() => {
                  handleComparePhotosSelection(image);
                }}
                style={{
                  cursor: 'pointer',
                  margin: '10px',
                  width: '100px',
                  height: '100px',
                  border: selectedImages.includes(image)
                    ? '5px solid blue'
                    : 'none',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <button onClick={() => setComparingPhotos(false)}>Cancel</button>
        </div>
        <div className="flex justify-center items-center">
          <button onClick={() => setDoneSelectedImages(true)}>
            Finish Selecting Images
          </button>
        </div>
      </div>
    );
  }

  const toggleMenu = () => {
    showMenu(!menu);
  };

  //if horizontally tabbed, then return a different component
  //The Resizable will be done left to right
  if (horizontally_tabbed) {
    return (
      <div className="page-container h-screen">
        <SideTab />
        <div
          className="z-100 absolute top-0 left-0"
          style={{ zIndex: 214748364 }}
        >
          <div className="flex flex-row ">
            <div className=" p-2 rounded-lg mr-5 ">
              <FaHome
                onClick={() => {
                  window.location.href = `/trip/${id}`;
                }}
                className="cursor-pointer dark:text-gray-800"
                size={30}
              />
            </div>

            <TripDropdownMenu />
          </div>
        </div>

        <div className="content-container-horizontal h-screen flex h-max-full ">
          <div className="MapComponent flex-grow">
            {typeof document !== 'undefined' &&
              (trip?.untimed_trips ? (
                <UntimedMapComponent height={`calc(100vh)`} />
              ) : (
                <MapComponent height={`calc(100vh)`} />
              ))}
          </div>

          <Resizable
            size={{ width: galleryWidth }}
            onResizeStop={(e, direction, ref, d) => {
              //set minmum size 50px

              console.log('Prev Gallery Width:', prevGalleryWidth.current);
              console.log('Dragged Width:', d.width);

              /*setGalleryWidth(
                Math.max(150, prevGalleryWidth.current + d.width)
              );*/
              const newWidth = prevGalleryWidth.current + d.width;

              const atLeast100 = Math.max(100, newWidth);
              const atMostScreenWidth = Math.min(
                screen_width - 100,
                atLeast100
              );
              console.log('Screen Width:', screen_width);

              console.log('atMostScreenWidth:', atMostScreenWidth);

              setGalleryWidth(atMostScreenWidth);

              prevGalleryWidth.current = atMostScreenWidth;
            }}
            onResize={(e, direction, ref, d) => {
              //make sure its not less than 100px
              //or more than screen width - 100px
              const newWidth = prevGalleryWidth.current + d.width;

              setGalleryWidth(newWidth);
            }}
            style={{
              cursor: 'col-resize',
              height: '100vh',
            }}
          >
            <SelectionComponentGallery />
          </Resizable>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SideTab />

      {/** Make Trip Dropdown Menu not take up any "space" - position absolutely on the page */}

      <div
        className="z-100 absolute top-0 left-0"
        style={{ zIndex: 214748364 }}
      >
        <div className="flex flex-row ">
          <div className=" p-2 rounded-lg mr-5 ">
            <FaHome
              onClick={() => {
                window.location.href = `/trip/${id}`;
              }}
              className="cursor-pointer dark:text-gray-800"
              size={30}
            />
          </div>

          <TripDropdownMenu />
        </div>
      </div>

      <div className="content-container max-h-full">
        <div
          className="MapComponent flex-grow"
          style={{ height: `calc(100vh - ${galleryHeight}px)` }}
        >
          {typeof document !== 'undefined' &&
            (trip?.untimed_trips ? (
              <UntimedMapComponent
                height={`calc(100vh - ${galleryHeight}px)`}
              />
            ) : (
              <MapComponent height={`calc(100vh - ${galleryHeight}px)`} />
            ))}
        </div>

        <Resizable
          size={{ height: galleryHeight }}
          onResizeStop={(e, direction, ref, d) => {
            //set minmum size 50px

            const min_gallery_height = 150;
            const max_gallery_height = screen_height - 150;

            const new_height = prevGalleryHeight.current + d.height;
            const atLeast150 = Math.max(min_gallery_height, new_height);
            const atMostScreenHeight = Math.min(max_gallery_height, atLeast150);

            console.log(screen_height);
            console.log(new_height);
            console.log(atLeast150);
            console.log(atMostScreenHeight);

            setGalleryHeight(atMostScreenHeight);

            prevGalleryHeight.current = atMostScreenHeight;
          }}
          onResize={(e, direction, ref, d) => {
            setGalleryHeight(prevGalleryHeight.current + d.height);
          }}
          style={{
            borderTop: '', // Add a top border
            cursor: 'row-resize',
            maxHeight: `calc(100vh - 150px)`,
          }}
        >
          <div
            style={{
              maxHeight: `${galleryHeight}px`,
              height: `${galleryHeight}px`,
              flexShrink: 1,
            }}
          >
            <SelectionComponentGallery />
          </div>
        </Resizable>
      </div>
      {/*<AddPathsForm /> */}
    </div>
  );
}
