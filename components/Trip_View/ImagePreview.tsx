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

import { useContext } from 'react';
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
  const { viewed_image_index, get_images_for_day, selected_date } =
    useTripViewStore();

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

  if (imagesLoading || tripLoading) {
    return <div>Loading...</div>;
  }

  if (viewed_image_index === null) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        <span
          className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
          onClick={clearPreviewImage}
        >
          &times;
        </span>
        <button
          className="absolute left-4 text-white text-3xl cursor-pointer"
          onClick={() => setPreviewImage(viewed_image_index - 1)}
          disabled={viewed_image_index === 0}
        >
          <FaChevronLeft />
        </button>
        <NextImage
          src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${imagesForDay[viewed_image_index].file_path}`}
          alt={`Image for ${imagesForDay[viewed_image_index].created_at}`}
          width={500}
          height={500}
        />
        <button
          className="absolute right-4 text-white text-3xl cursor-pointer"
          onClick={() => setPreviewImage(viewed_image_index + 1)}
          disabled={viewed_image_index === imagesForDay.length - 1}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
