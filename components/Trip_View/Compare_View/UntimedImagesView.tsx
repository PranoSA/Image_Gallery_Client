/*

    All Images That either have no time data
    or have undefined time data
    or have nonsensical time data [time>24 hours]

    or time data that is not in the trip time range

    
*/
import { Image, Trip } from '@/definitions/Trip_View';

import {
  useQueryTripImages,
  UpdateImage,
  tripViewStore,
  useDeleteImage,
  useQueryTrip,
  useTripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';

import TripContext from '@/components/TripContext';
import { useContext, useMemo } from 'react';

//import FaIcons (Eye -> View) (Plus -> Add) (Trash -> Delete)
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';

import EditImageModal from '@/components/Trip_View/EditImageForm';

import NextImage from 'next/image';

const UntimedImagesView = () => {
  const { id } = useContext(TripContext);

  const deleteImage = useDeleteImage();

  //locally store the image time data
  const { data: images, isLoading, isError } = useQueryTripImages(id);

  const {
    data: trip,
    isLoading: tripIsLoading,
    isError: tripIsError,
  } = useQueryTrip(id);

  const { editingImage } = useTripViewStore();

  const deleteImageEvent = async (image: Image) => {
    const _ = await deleteImage.mutate(image);
  };

  const untimedImages = useMemo(() => {
    if (!images || !trip) return [];

    //if trip is untimed, only return images that have invalid dates or 1970-01-01 (timestamp value of 0)
    if (trip.untimed_trips) {
      return images.filter((image) => {
        return (
          image.created_at === null ||
          image.created_at === undefined ||
          (image.created_at.getFullYear() === 1970 &&
            image.created_at.getMonth() === 0 &&
            image.created_at.getDate() === 1)
        );
      });
    }

    const trip_start = new Date(trip.start_date);
    const offset_minutes = trip_start.getTimezoneOffset();
    trip_start.setMinutes(trip_start.getMinutes() + offset_minutes);

    const trip_end = new Date(trip.end_date);
    trip_end.setMinutes(trip_end.getMinutes() + offset_minutes);
    //add 23 hours, 59 minutes, 59 seconds to the trip end date
    trip_end.setHours(trip_end.getHours() + 23);
    trip_end.setMinutes(trip_end.getMinutes() + 59);
    trip_end.setSeconds(trip_end.getSeconds() + 59);
    trip_end.setMilliseconds(trip_end.getMilliseconds() + 999);

    return images.filter((image) => {
      //test if before trip start
      if (image.created_at < trip_start) return true;
      if (image.created_at > trip_end) return true;
      return image.created_at === null || image.created_at === undefined;
    });
  }, [images, trip]);

  const setPreviewImage = (image: Image) => {
    if (!images) return;
    //find the index of the image
    const index = images.findIndex((i) => i.id === image.id);
    if (index === -1) return;

    tripViewStore.setState((state) => {
      return {
        ...state,
        previewImageIndex: index,
      };
    });
  };

  const openEditImageModal = (image: Image) => {
    tripViewStore.setState((state) => {
      const new_state: typeof state = {
        ...state,
        editingImage: image,
      };

      return new_state;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  if (!untimedImages) {
    return <div>No Images</div>;
  }

  if (untimedImages.length === 0) {
    return (
      <div>
        <div className="flex justify-center items-center w-full h-96">
          <h1 className="text-2xl text-gray-500">No untimed images</h1>
        </div>
      </div>
    );
  }

  //Return a Gallery View of the images With
  //"Eye" -> Sets Preview Image to the image
  //"Edit" -> Opens Up EditImageModal
  //"Delete" -> Deletes the Image
  return (
    <div className="container mx-auto p-4">
      {editingImage && <EditImageModal />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {untimedImages.map((image, index) => (
          <div
            key={index}
            className="relative border rounded-lg overflow-hidden"
          >
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              layout="responsive"
              width={500}
              height={300}
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
              <button
                className="text-white mx-2"
                onClick={() => setPreviewImage(image)}
              >
                <FaEye />
              </button>
              <button
                className="text-white mx-2"
                onClick={() => openEditImageModal(image)}
              >
                <FaEdit />
              </button>
              <button
                className="text-white mx-2"
                onClick={() => deleteImageEvent(image)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UntimedImagesView;
