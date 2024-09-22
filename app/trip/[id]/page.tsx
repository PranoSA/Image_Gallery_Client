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
} from '@/components/Trip_View/Trip_View_Image_Store';
import Image_View_ByDate from '@/components/Trip_View/Date_View/Image_View_ByDate';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import TripContext from '@/components/TripContext';
import SelectionComponentGallery from '@/components/Trip_View/SelectionComponentGallery';
import { Resizable } from 're-resizable';
//process.env.NEXT_PUBLIC_API_URL

const useTripContext = () => {
  return useContext(TripContext);
};

interface TripProviderProps {
  children: React.ReactNode;
  id: string;
}

const TripProvider = ({ children, id }: TripProviderProps) => {
  return <TripContext.Provider value={{ id }}>{children}</TripContext.Provider>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  return (
    <TripProvider id={id || '0'}>
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
  const { id } = useTripContext();

  const [galleryHeight, setGalleryHeight] = useState(400); // Initial height of the gallery
  const prevGalleryHeight = useRef<number>(galleryHeight);

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
      console.log('Path:', path);
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

  const imagesForDay =
    (images &&
      images
        .filter((i) => i.created_at.split('T')[0] === currentDay())
        .sort((a, b) => a.created_at.localeCompare(b.created_at))) ||
    [];

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

  return (
    <div className="page-container">
      {/*
      {pathModalSelected != null && pathModalPosition && (
        <PathMapModal
          path={pathModalSelected}
          closeModal={() => {
            setPathModalSelected(null);
          }}
          position={pathModalPosition}
        />
      )}
      <div className="relative inline-block text-left">
        <button
          onClick={toggleMenu}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {menu ? 'Close Menu' : 'Open Menu'}
          {menu ? (
            <FaChevronUp className="ml-2" />
          ) : (
            <FaChevronDown className="ml-2" />
          )}
        </button>
        {menu && (
          <div className="z-50 origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => setComparingPhotos(!comparingPhotos)}
              >
                {comparingPhotos ? 'Stop Comparing Photos' : 'Compare Photos'}
              </button>
              <Modal
                isOpen={pathModalOpen}
                onClose={() => setPathModalOpen(!pathModalOpen)}
                onSubmit={submitModal}
              />
            </div>
          </div>
        )}
      </div>
      */}
      <TripDropdownMenu />
      {day_by_day_banners && bannerComponent}

      <div className="content-container">
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
          onResize={
            (e, direction, ref, d) => {
              setGalleryHeight(prevGalleryHeight.current + d.height);
            }
            //console.log('Resizing:', d.height)
          }
          style={{
            borderTop: '5px solid #000', // Add a top border
            cursor: 'row-resize',
          }}
        >
          <SelectionComponentGallery />
        </Resizable>
      </div>
      <AddPathsForm />
    </div>
  );
}
