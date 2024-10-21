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

import { useContext, useEffect, useState } from 'react';
import TripContext from '@/components/TripContext';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import NextImage from 'next/image';
import { FaPen } from 'react-icons/fa';

import {
  useTripViewStore,
  tripViewStore,
  useQueryTrip,
  useQueryTripImages,
  UpdateImage,
} from './Trip_View_Image_Store';

const ImagePreview: React.FC = () => {
  const {
    viewed_image_index,
    get_images_for_day,
    selected_date,
    selected_image_location,
  } = useTripViewStore();

  const selected_trip_id = useContext(TripContext).id;

  const [editingCurrentImage, setEditingCurrentImage] =
    useState<boolean>(false);

  const [editedName, setEditedName] = useState<string>('');

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
    setEditingCurrentImage(false);
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

  const editImage = UpdateImage();

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

  if (imagesLoading || tripLoading) {
    return <div>Loading...</div>;
  }

  if (viewed_image_index === null) {
    return null;
  }

  if (!images) {
    return <div>No images found</div>;
  }

  const submitNewName = async () => {
    if (!editedName) return; //this should
    if (!trip) return;

    //what is the current index
    const current_index = viewed_image_index;
    const current_image = images[current_index];

    const new_image = {
      ...current_image,
      name: editedName,
    };

    const res = await editImage.mutate({ image: new_image, trip });

    setEditingCurrentImage(false);

    setEditedName('');
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Escape') {
      setEditedName('');
      setEditingCurrentImage(false);
    } else if (e.key === 'Enter') {
      await submitNewName();
      setEditedName('');
      setEditingCurrentImage(false);
    }
  };

  const handleBlur = () => {
    setEditingCurrentImage(false);
    setEditedName('');
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-30 h-full w-full ">
      <div className="relative w-full h-full flex items-center justify-center max-h-full ">
        <FaTimes
          className="absolute top-4 right-4 z-40 text-white text-3xl cursor-pointer"
          onClick={clearPreviewImage}
        />

        <FaChevronLeft
          className="absolute z-50 left-4 text-white text-3xl cursor-pointer "
          onClick={() => {
            if (viewed_image_index < 1) return;

            setEditingCurrentImage(false);

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
        />
        <div className="flex flex-col flex-grow items-center justify-center h-full">
          <div className="relative flex-grow flex items-center justify-center h-full w-full ">
            {/*<img
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${images[viewed_image_index].file_path}`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              className="object-contain max-h-full"
            />*/}
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${images[viewed_image_index].file_path}`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              fill
              //ensure it keeps the aspect ratio
              objectFit="contain"
            />
          </div>
          <div className="text-white text-2xl mt-2 flex-shrink-0">
            {editingCurrentImage ? (
              <div>
                <input
                  type="text"
                  value={editedName}
                  className="bg-gray-800 text-white p-1 mb-4"
                  //add "enter" key to save
                  //add "esc" key to cancel

                  onChange={(e) => {
                    setEditedName(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                />
              </div>
            ) : (
              <div>
                <p> {selected_image_location?.name} </p>
                <FaPen
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingCurrentImage(true);
                    setEditedName(selected_image_location?.name || '');
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <FaChevronRight
          className="absolute right-4 text-white text-3xl cursor-pointer"
          onClick={() => {
            if (viewed_image_index === images.length - 1) return;

            setEditingCurrentImage(false);

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
          //disabled={viewed_image_index === images.length - 1}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
