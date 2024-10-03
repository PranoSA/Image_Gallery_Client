'use client';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';

import '@/globals.css';

import { TripDropdownMenu } from '@/components/Trip_View/TripDropdownOptions';

import { Banner_Component } from '@/components/Trip_View/Banner_Component';

import MapComponent from '@/components/Trip_View/MapComponent';

import AddPathsForm from '@/components/Trip_View/AddPathsForm';
import axios from 'axios';
import NextImage from 'next/image';
import Modal from '@/components/PathModal';

import { KML } from 'ol/format';
import { HiOutlinePencil } from 'react-icons/hi';

import type { Image, Path, Trip } from '@/definitions/Trip_View';

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

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import TripContext from '@/components/TripContext';
import SelectionComponentGallery from '@/components/Trip_View/SelectionComponentGallery';
import { Resizable } from 're-resizable';

import {
  useSession,
  UseSessionOptions,
  SessionProvider,
} from 'next-auth/react';
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
}

const TripProvider = ({ children, id, setBearerToken }: TripProviderProps) => {
  return (
    <TripContext.Provider value={{ id, bearer_token: null, setBearerToken }}>
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

  const [galleryHeight, setGalleryHeight] = useState(400); // Initial height of the gallery
  const prevGalleryHeight = useRef<number>(galleryHeight);

  //width of the gallery
  const [galleryWidth, setGalleryWidth] = useState(600);
  const prevGalleryWidth = useRef<number>(galleryWidth);

  const { data: session } = useSession();

  useEffect(() => {
    //store the access token in local storage
    if (session?.accessToken) {
      localStorage.removeItem('accessToken');
      localStorage.setItem('accessToken', session.accessToken);
    }
    setBearerToken(session?.accessToken || '');
    //set tripContext bearer token
  }, [session, setBearerToken]);

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
  const pathFromFeature = useRef<Map>(new Map());

  const imagesForDay: Image[] = useMemo(() => {
    return get_images_for_day(
      selected_date,
      trip?.start_date || '1970-01-01',
      images || []
    );
  }, [selected_date, trip, images]);

  //add interactivity to the map

  const [pathModalSelected, setPathModalSelected] = useState<Path | null>(null);
  const [pathModalPosition, setPathModalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  //store computed Banner Component
  const bannerComponent = useMemo(() => {
    return <Banner_Component />;
  }, []);

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
      const pathId = pathFromFeature.current.get(featureId);

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
      <div className="page-container">
        <div
          className="z-100 absolute top-0 left-0"
          style={{ zIndex: 214748364 }}
        >
          <TripDropdownMenu />
        </div>

        <div className="content-container-horizontal">
          <div className="MapComponent">
            <MapComponent height={`calc(100vh - 50px)`} />
          </div>

          <Resizable
            size={{ width: galleryWidth }}
            onResizeStop={(e, direction, ref, d) => {
              //set minmum size 50px

              setGalleryWidth(
                Math.max(150, prevGalleryWidth.current + d.width)
              );
              prevGalleryWidth.current = Math.max(
                150,
                prevGalleryWidth.current + d.width
              );
            }}
            onResize={(e, direction, ref, d) => {
              setGalleryWidth(prevGalleryWidth.current + d.width);
            }}
            style={{
              borderLeft: '5px solid #000', // Add a top border
              cursor: 'col-resize',
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
      {/** Make Trip Dropdown Menu not take up any "space" - position absolutely on the page */}

      <div
        className="z-100 absolute top-0 left-0"
        style={{ zIndex: 214748364 }}
      >
        <TripDropdownMenu />
      </div>

      <div className="content-container">
        {day_by_day_banners && bannerComponent}
        <div
          className="MapComponent"
          style={{ height: `calc(100vh - ${galleryHeight}px)` }}
        >
          <MapComponent height={`calc(100vh - ${galleryHeight}px)`} />
        </div>

        <Resizable
          size={{ height: galleryHeight }}
          onResizeStop={(e, direction, ref, d) => {
            //set minmum size 50px

            setGalleryHeight(
              Math.max(150, prevGalleryHeight.current + d.height)
            );
            prevGalleryHeight.current = Math.max(
              150,
              prevGalleryHeight.current + d.height
            );
          }}
          onResize={(e, direction, ref, d) => {
            setGalleryHeight(prevGalleryHeight.current + d.height);
          }}
          style={{
            borderTop: '5px solid #000', // Add a top border
            cursor: 'row-resize',
          }}
        >
          <SelectionComponentGallery />
        </Resizable>
      </div>
      {/*<AddPathsForm /> */}
    </div>
  );
}
