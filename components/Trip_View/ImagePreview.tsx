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

import { useContext, useEffect, useRef, useState } from 'react';
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
import { useCompareViewStore } from './Compare_View/CompareStore';

type ImagePreviewProps = {
  preset_images?: {
    preset: boolean;
    images: Image[];
  };
  setInZoom?: (image: Image) => void;
};

const ImagePreview: React.FC<ImagePreviewProps> = ({
  preset_images = { preset: false, images: [] },
  setInZoom = (image: Image) => {},
}) => {
  const {
    viewed_image_index,
    get_images_for_day,
    //selected_date,
    selected_image_location,
  } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  const selected_trip_id = useContext(TripContext).id;

  const [editingCurrentImage, setEditingCurrentImage] =
    useState<boolean>(false);

  const [editedName, setEditedName] = useState<string>('');

  const [imageLoading, setImageLoading] = useState<boolean>(true);

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

  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  //listen to if new day in the images
  useEffect(() => {
    if (!images) return;
    if (preset_images.preset) return;
    if (viewed_image_index === null) return;

    console.log('Scan, ', viewed_image_index);

    //call setInZoom
    setInZoom(images[viewed_image_index]);

    // get current untimed_trips_selected_date
    const current_day = new Date(images[viewed_image_index].created_at);

    //get day of untimed_trips_selected_date
    const untimed_day = new Date(untimed_trips_selected_date);

    //check if the day , month and year are the same
    if (
      current_day.getDate() === untimed_day.getDate() &&
      current_day.getMonth() === untimed_day.getMonth() &&
      current_day.getFullYear() === untimed_day.getFullYear()
    ) {
      return;
    }

    //else -> set the untimed_trips_selected_date to the current day
    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_date: current_day.getDate(),
      };
    });
  }, [
    images,
    preset_images.preset,
    setInZoom,
    untimed_trips_selected_date,
    viewed_image_index,
  ]);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.focus();
    }
  }, []);

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
    setImageLoading(true);
  };

  const editImage = UpdateImage();

  useEffect(() => {
    const handleKeyDownMount = (event: KeyboardEvent) => {
      console.log('key pressed', event.key);
      console.log('divRef.current', divRef.current);
      if (!divRef.current) return;
      console.log('key pressed div not null', event.key);
      //if currently editing , return
      if (editingCurrentImage) return;

      switch (event.key) {
        case 'F2':
          console.log('F2 key pressed');
          setEditingCurrentImage(true);
          setEditedName(selected_image_location?.name || '');
          //focus on the input, after a delay
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
          break;
        case 'Escape':
          console.log('Escape key pressed');
          clearPreviewImage();
          break;
        case 'ArrowLeft':
          console.log('ArrowLeft key pressed');
          if (viewed_image_index === null) return;
          if (viewed_image_index > 0) {
            tripViewStore.setState((state) => {
              return {
                ...state,
                viewed_image_index: viewed_image_index - 1,
              };
            });
          }
          break;
        case 'ArrowRight':
          console.log('ArrowRight key pressed');
          if (viewed_image_index === null || !images) return;
          //check if preset
          if (preset_images.preset) {
            if (viewed_image_index === preset_images.images.length - 1) return;
          } else {
            if (viewed_image_index === images.length - 1) return;
          }

          if (viewed_image_index < images.length - 1) {
            tripViewStore.setState((state) => {
              return {
                ...state,
                viewed_image_index: viewed_image_index + 1,
              };
            });
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDownMount);

    return () => {
      document.removeEventListener('keydown', handleKeyDownMount);
    };
  }, [
    images,
    selected_image_location?.name,
    viewed_image_index,
    editingCurrentImage,
    preset_images.preset,
    preset_images.images.length,
  ]);

  useEffect(() => {
    if (viewed_image_index === null) return;
    if (!images) return;
    //set the image location to the image at the index
    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_image_location: preset_images.preset
          ? preset_images.images[viewed_image_index]
          : images[viewed_image_index],
      };
    });
  }, [images, preset_images.images, preset_images.preset, viewed_image_index]);

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
    const current_image = preset_images.preset
      ? preset_images.images[current_index]
      : images[current_index];

    const new_image = {
      ...current_image,
      name: editedName,
    };

    const res = await editImage.mutate({ image: new_image, trip });

    // un focus the input
    inputRef.current?.blur();

    setEditingCurrentImage(false);

    setEditedName('');
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    //if currently editing , return

    if (e.key === 'Escape') {
      setEditedName('');
      setEditingCurrentImage(false);
      //set focus back to the div, after 100 s
      console.log('DivRef', divRef.current);
      setTimeout(() => {
        divRef.current?.focus();
      }, 100);
    } else if (e.key === 'Enter') {
      await submitNewName();
      setEditedName('');
      setEditingCurrentImage(false);
    }
    e.stopPropagation();
  };

  //listen to if there is a new day in the images

  const handleKeyDownOutside = async (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    //if currently editing , return
    if (editingCurrentImage) return;
    console.log('divRef.current', divRef.current);

    console.log('key pressed', e.key);
    //F2-> start editing
    if (e.key === 'F2') {
      setEditingCurrentImage(true);
      setEditedName(selected_image_location?.name || '');
      //focus on the input, after a delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    // right arrow -> next image
    else if (e.key === 'ArrowRight') {
      //check if preset
      if (preset_images.preset) {
        if (viewed_image_index === preset_images.images.length - 1) return;
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

      const next_day = new Date(images[viewed_image_index + 1].created_at);

      if (currenn_day.getDate() !== next_day.getDate()) {
        /*tripViewStore.setState((state) => {
          return {
            ...state,
            selected_date: selected_date + 1,
          };
        });*/
      }
    }
    // left arrow -> previous image
    else if (e.key === 'ArrowLeft') {
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
      const previous_day = new Date(images[viewed_image_index - 1].created_at);

      if (currenn_day.getDate() !== previous_day.getDate()) {
        /*tripViewStore.setState((state) => {
          return {
            ...state,
            selected_date: selected_date - 1,
          };
        });*/
      }
    }
    // esc -> Exit Preview
    else if (e.key === 'Escape') {
      clearPreviewImage();
    }

    e.stopPropagation();
  };

  const handleBlur = () => {
    setEditingCurrentImage(false);
    setEditedName('');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50  h-full w-full "
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
          className={`absolute z-50 left-4  text-3xl cursor-pointer 
            ${viewed_image_index === 0 ? 'text-black' : 'text-white'}
            `}
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
              /*tripViewStore.setState((state) => {
                return {
                  ...state,
                  selected_date: selected_date - 1,
                };
              });*/
            }
          }}
        />
        <div
          className="flex flex-col flex-grow items-center justify-center h-full mt-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
          tabIndex={0}
          onKeyDown={handleKeyDownOutside}
          ref={divRef}
        >
          <div className="relative  flex items-center justify-center h-3/4 w-full lg:w-3/4 xl:w-1/2 ">
            {/*<img
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${images[viewed_image_index].file_path}`}
              alt={`Image for ${images[viewed_image_index].created_at}`}
              className="object-contain max-h-full"
            />*/}

            {imageLoading && <div className="loader">Loading...</div>}
            {true && (
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
                onLoad={() => setImageLoading(false)}
                objectFit="contain"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </div>
          <div className="text-white text-2xl  flex-shrink-0 flex-col">
            {/* Show the Date and Time in a  Column*/}
            <div className="dark:text-neon-green text-sm">
              {new Date(
                preset_images.preset
                  ? preset_images.images[viewed_image_index].created_at
                  : images[viewed_image_index].created_at
              ).toLocaleDateString()}
            </div>
            <div className="dark:text-neon-green text-sm">
              {
                /* not showing the time */
                new Date(
                  preset_images.preset
                    ? preset_images.images[viewed_image_index].created_at
                    : images[viewed_image_index].created_at
                )
                  .toLocaleTimeString()
                  .split(':')
                  .slice(0, 2)
                  .join(':')
                  //add "PM" or "AM"
                  .concat(
                    ' ',
                    new Date(
                      preset_images.preset
                        ? preset_images.images[viewed_image_index].created_at
                        : images[viewed_image_index].created_at
                    )
                      .toLocaleTimeString()
                      .split(' ')[1]
                  )
              }
            </div>
          </div>
          <div className="text-white text-lg mt-1 flex-shrink-0 bg-opacity-90 ">
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
                  ref={inputRef}
                />
              </div>
            ) : (
              <div>
                <div className="flex flex-row w-full">
                  <p>{selected_image_location?.name}</p>
                  <FaPen
                    className="cursor-pointer ml-4"
                    size={20}
                    onClick={() => {
                      setEditingCurrentImage(true);
                      setEditedName(selected_image_location?.name || '');
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 100);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <FaChevronRight
          className={`absolute right-4 text-3xl cursor-pointer ${
            preset_images.preset
              ? viewed_image_index === preset_images.images.length - 1
                ? 'text-black'
                : 'text-white'
              : viewed_image_index === images.length - 1
          } 
            `}
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
              /*tripViewStore.setState((state) => {
                return {
                  ...state,
                  selected_date: selected_date + 1,
                };
              });*/
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
