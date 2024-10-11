/**
 *
 * Takes the images in order
 *
 * Then when you left / right goes to the next image
 *
 * Changes selected image location
 *
 * Changes  selected_date if the Date changes
 *
 */

import { useContext, useEffect } from 'react';
import TripContext from '@/components/TripContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import NextImage from 'next/image';

import {
  useTripViewStore,
  tripViewStore,
  useQueryTrip,
  useQueryTripImages,
} from './Trip_View_Image_Store';

const ImagePreview: React.FC = () => {
  const {
    viewed_image_index,
    get_images_for_day,
    selected_date,
    selected_image_location,
  } = useTripViewStore();

  const selected_trip_id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(selected_trip_id);

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(selected_trip_id);

  const clearPreviewImage = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: null,
      };
    });
  };

  const setPreviewImage = (index: number) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: index,
      };
    });
  };

  const imagesForDay = get_images_for_day(
    selected_date,
    trip?.start_date || '1970-01-01',
    images || []
  );

  useEffect(() => {
    if (viewed_image_index === null) return;
    if (!images) return;
    //set the image location to the image at the index
    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_image_location: images[viewed_image_index],
      };
    });
  }, [images, viewed_image_index]);

  console.log('Viewed Image Index', viewed_image_index);

  if (imagesLoading || tripLoading) {
    return <div>Loading...</div>;
  }

  if (viewed_image_index === null) {
    return null;
  }

  if (!images) {
    return <div>No images found</div>;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full h-full flex items-center justify-center max-h-full">
        <span
          className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
          onClick={clearPreviewImage}
        >
          &times;
        </span>
        <button
          className="absolute left-4 text-white text-3xl cursor-pointer"
          onClick={() => {
            if (viewed_image_index < 1) return;

            //detect a day change
            const currenn_day = new Date(images[viewed_image_index].created_at);
            const previous_day = new Date(
              images[viewed_image_index - 1].created_at
            );

            //go back one image
            tripViewStore.setState((state) => {
              return {
                ...state,
                viewed_image_index: viewed_image_index - 1,
              };
            });

            if (currenn_day.getDate() !== previous_day.getDate()) {
              tripViewStore.setState((state) => {
                return {
                  ...state,
                  selected_date: selected_date - 1,
                };
              });
            }

            setPreviewImage(viewed_image_index - 1);
          }}
          disabled={viewed_image_index === 0}
        >
          <FaChevronLeft />
        </button>
        <div className="flex flex-col items-center justify-center h-full max-h-full">
          <div className="flex-grow flex-shrink flex items-center justify-center max-h-[80%] max-w-[100%]">
            <img
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${images[viewed_image_index].file_path}`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              className="object-contain max-h-full"
            />
          </div>
          <div className="text-white text-2xl mt-2 flex-shrink-0">
            {images[viewed_image_index].name}
          </div>
        </div>
        <button
          className="absolute right-4 text-white text-3xl cursor-pointer"
          onClick={() => {
            if (viewed_image_index === images.length - 1) return;

            //detect a day change
            const currenn_day = new Date(images[viewed_image_index].created_at);

            const next_day = new Date(
              images[viewed_image_index + 1].created_at
            );

            tripViewStore.setState((state) => {
              return {
                ...state,
                viewed_image_index: viewed_image_index + 1,
              };
            });

            if (currenn_day.getDate() !== next_day.getDate()) {
              tripViewStore.setState((state) => {
                return {
                  ...state,
                  selected_date: selected_date + 1,
                };
              });
            }
          }}
          disabled={viewed_image_index === images.length - 1}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
