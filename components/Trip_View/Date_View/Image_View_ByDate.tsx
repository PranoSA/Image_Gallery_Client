'use client';

import { Image } from '@/definitions/Trip_View';

import { HiOutlinePencil, HiEye } from 'react-icons/hi';

import NextImage from 'next/image';
import CoordinateForm from '@/components/CoordinateForm';

import {
  useTripViewStore,
  useQueryTripImages,
  useQueryTrip,
  tripViewStore,
  UpdateImage,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useContext } from 'react';

import EditImageForm from '@/components/Trip_View/EditImageForm';
import ImagePreview from '@/components/Trip_View/ImagePreview';

import TripContext from '@/components/TripContext';

const Image_View_ByDate: React.FC = () => {
  const {
    selected_date,

    get_images_for_day,
    viewed_image_index,
    selected_image_location,
    editingImage,
  } = useTripViewStore();

  // mutate
  const selected_trip_id = useContext(TripContext).id;

  //get trip id from the store

  //get the trip info
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripLoadingError,
  } = useQueryTrip(selected_trip_id);

  //use query to get the images for the trip
  const {
    data: images,
    isLoading,
    error,
  } = useQueryTripImages(selected_trip_id);

  const [editedImage, setEditedImage] = useState<Image | null>(null);

  //set up mutation for updating the image
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (tripLoading) {
    return <div>Loading...</div>;
  }

  //if selected_id is null, return loading
  if (!selected_trip_id) {
    return <div>Loading...</div>;
  }
  if (tripLoadingError) {
    return <div>Error Loading Trip</div>;
  }

  const imagesForDay = get_images_for_day(
    selected_date,
    trip?.start_date || '1970-01-01',
    images || []
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error Loading Images </div>;
  }
  if (!images) {
    return <div>No images</div>;
  }

  const handleImageClick = (image: Image) => {
    //set the selected image location

    //clear if already selected
    if (selected_image_location && selected_image_location.id === image.id) {
      tripViewStore.setState((state) => {
        return {
          ...state,
          selected_image_location: null,
        };
      });
      return;
    }

    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_image_location: image,
      };
    });
  };

  //handle edit image shows the edit image form
  const handleEditImage = (image: Image) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        editingImage: image,
      };
    });
    setEditedImage(image);
  };

  const setPreviewImage = (index: number) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: index,
      };
    });
  };

  return (
    <div>
      <div className="gallery mt-4">
        {imagesForDay.map((image, i) => (
          <div key={image.id}>
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              width={100}
              height={100}
              onClick={() => handleImageClick(image)}
              style={{
                cursor: 'pointer',
                margin: '10px',
                width: '100px',
                height: '100px',
                border:
                  selected_image_location &&
                  selected_image_location.id === image.id
                    ? '5px solid blue'
                    : 'none',
              }}
            />
            <HiOutlinePencil
              onClick={() => handleEditImage(image)}
              className="cursor-pointer"
            />
            <HiEye
              onClick={() => setPreviewImage(i)}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
      <ImagePreview />
    </div>
  );
};

export default Image_View_ByDate;
