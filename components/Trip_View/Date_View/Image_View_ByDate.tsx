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
import { useState } from 'react';

export const Image_View_ByDate: React.FC = () => {
  const {
    selected_date,
    selected_images,
    selected_trip_id,
    get_images_for_day,
    viewed_image_index,
    selected_image_location,
    selected_image_preview,
    editingImage,
  } = useTripViewStore();

  // mutate

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

  if (tripLoading) {
    return <div>Loading...</div>;
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
    return <div>Error: {error.message}</div>;
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

  const clearPreviewImage = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: null,
      };
    });
  };

  const submitEditedImage = async () => {
    if (!editedImage) return;

    try {
      //use the update image mutation
      UpdateImage().mutate(editedImage, trip?.id || '');

      //setEditingImage(null)
      tripViewStore.setState((state) => {
        return {
          ...state,
          editingImage: null,
        };
      });

      setEditedImage(null);
    } catch (err) {
      console.error('Error editing image:', err);
    }
  };

  const handleEditedImageChange = (e: any) => {
    const field = e.target.name;

    const value = e.target.value;

    if (!editedImage) return;

    setEditedImage({
      ...editedImage,
      [field]: value,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Date of the Edited Image
    if (!editedImage) return;

    //This will splitting the created_at and changing the date and joining the time back
    const [date, time] = e.target.value.split('T');

    const new_created_at = `${date}T${editedImage.created_at.split('T')[1]}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Time of the Edited Image
    if (!editedImage) return;

    //This will splitting the created_at and changing the time and joining the date back
    const [date, time] = editedImage.created_at.split('T');

    const new_time = e.target.value;

    const new_created_at = `${
      editedImage.created_at.split('T')[0]
    }T${new_time}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const cancelEditImage = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        editingImage: null,
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
      {viewed_image_index && trip && (
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
              alt={`Image for ${images[viewed_image_index].created_at}`}
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
      )}
      {editingImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEditedImage();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={editedImage?.description || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Add created_at,  */}
              <div className="mb-4">
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editedImage?.name || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={editedImage?.description || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Created At:</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={editedImage?.created_at.split('T')[0]}
                    onChange={handleDateChange}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="time"
                    value={
                      editedImage?.created_at
                        .split('T')[1]
                        .split('+')[0]
                        .split('-')[0]
                    }
                    onChange={handleTimeChange}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              {/* Use The Coordinate Form Component */}
              <CoordinateForm
                editedImage={editedImage}
                setEditedImage={setEditedImage}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={submitEditedImage}
              >
                Save
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => cancelEditImage()}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
