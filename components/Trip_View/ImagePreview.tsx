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
import { Image } from '@/definitions/Trip_View';

type ImagePreviewProps = {
  preset_images?: {
    preset: boolean;
    images: Image[];
  };
};

const ImagePreview: React.FC<ImagePreviewProps> = ({
  preset_images = { preset: false, images: [] },
}) => {
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
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75  h-full w-full "
      style={{
        zIndex: 1000,
      }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center max-h-full "
        style={{
          zIndex: 100000,
        }}
        onClick={clearPreviewImage}
      >
        <FaTimes className="absolute top-4 right-4 z-40 text-white text-3xl cursor-pointer" />

        <FaChevronLeft
          className="absolute z-50 left-4 text-white text-3xl cursor-pointer "
          aria-disabled={viewed_image_index === 0}
          style={{
            zIndex: 10000000,
          }}
          onClick={(e) => {
            e.stopPropagation();
            //check if preset
            if (preset_images.preset) {
              if (viewed_image_index < 1) return;
            } else {
              if (viewed_image_index < 1) return;
            }

            setEditingCurrentImage(false);
            //go back one image

            setPreviewImage(viewed_image_index - 1);

            //if preset, return
            if (preset_images.preset) return;

            //detect a day change
            const currenn_day = new Date(images[viewed_image_index].created_at);
            const previous_day = new Date(
              images[viewed_image_index - 1].created_at
            );

            if (currenn_day.getDate() !== previous_day.getDate()) {
              tripViewStore.setState((state) => {
                return {
                  ...state,
                  selected_date: selected_date - 1,
                };
              });
            }
          }}
        />
        <div className="flex flex-col flex-grow items-center justify-center h-full mt-10">
          <div className="relative flex-grow flex items-center justify-center h-full w-full lg:w-3/4 xl:w-1/2 ">
            {/*<img
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${images[viewed_image_index].file_path}`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              className="object-contain max-h-full"
            />*/}
            <NextImage
              onClick={(e) => e.stopPropagation()}
              className="border-2 border-white rounded-lg"
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${
                preset_images.preset
                  ? preset_images.images[viewed_image_index].file_path
                  : images[viewed_image_index].file_path
              }`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              fill
              //ensure it keeps the aspect ratio
              objectFit="contain"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw"
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
          size={0}
          style={{
            zIndex: 10000000,
          }}
          onClick={(e) => {
            e.stopPropagation();
            //check if preset
            if (preset_images.preset) {
              if (viewed_image_index === preset_images.images.length - 1)
                return;
            } else {
              if (viewed_image_index === images.length - 1) return;
            }

            setEditingCurrentImage(false);

            tripViewStore.setState((state) => {
              return {
                ...state,
                viewed_image_index: viewed_image_index + 1,
              };
            });

            //if preset, return
            if (preset_images.preset) return;

            //detect a day change
            const currenn_day = new Date(images[viewed_image_index].created_at);

            const next_day = new Date(
              images[viewed_image_index + 1].created_at
            );

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
          aria-disabled={
            preset_images.preset
              ? viewed_image_index === preset_images.images.length - 1
              : viewed_image_index === images.length - 1
          }
        />
      </div>
    </div>
  );
};

export default ImagePreview;
