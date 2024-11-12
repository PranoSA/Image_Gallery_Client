/**
 *
 *
 * With the untimed one, we skip unused dates
 *
 */
'use client';

import { Image } from '@/definitions/Trip_View';

import { HiOutlinePencil, HiEye, HiMap } from 'react-icons/hi';

import NextImage from 'next/image';
import CoordinateForm from '@/components/CoordinateForm';

import {
  useTripViewStore,
  useQueryTripImages,
  useQueryTrip,
  tripViewStore,
  useDeleteImage,
  UpdateImage,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useContext, useMemo, useRef, useEffect } from 'react';

import EditImageForm from '@/components/Trip_View/EditImageForm';
import ImagePreview from '@/components/Trip_View/ImagePreview';

import '@/components/Trip_View/Date_View/Image_View_ByDate.css';

import TripContext from '@/components/TripContext';
import { Banner_Component } from '@/components/Trip_View/Compare_View/Untimed_Compare_View/Banner_Component';

import {} from '@/components/Trip_View/Time_View/Time_View_Gallery';

import { AiFillDelete } from 'react-icons/ai';
import { useCompareViewStore } from '../Compare_View/CompareStore';
import { FaPencil } from 'react-icons/fa6';

type ImageViewByDateProps = {
  scrollToImage?: (image: Image) => void;
};

const Image_View_ByDateUntimed: React.FC<ImageViewByDateProps> = ({
  scrollToImage = (image: Image) => {},
}) => {
  const {
    selected_date,

    selected_image_location,
    editingImage,
    filtered_categories,
    viewed_image_index,
  } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

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

  const bannerComponent = useMemo(() => {
    return <Banner_Component />;
  }, []);

  type ImagesByDay = {
    date: Date;
    images: (Image & { index: number })[];
  };

  const candidate_dates = useMemo(() => {
    //Pretty much, return a list of every unique date in the images

    const unique_dates: Date[] = [];

    if (!images) return [];

    let last_saw_date = new Date(images[0].created_at);

    unique_dates.push(last_saw_date);

    images.forEach((image) => {
      const current_date = new Date(image.created_at);

      if (current_date.toDateString() !== last_saw_date.toDateString()) {
        unique_dates.push(current_date);
        last_saw_date = current_date;
      }
    });

    return unique_dates;
  }, [images]);

  const groupedOrderedImagesByDay: ImagesByDay = useMemo(() => {
    const groupImagesByDay = (images: Image[] | undefined): ImagesByDay => {
      if (!trip) return { date: new Date(), images: [] };
      if (!images) return { date: new Date(), images: [] };

      //use the date of untimed_trips_selected_date
      const images_today = images.filter((image) => {
        const image_date = new Date(image.created_at);
        return (
          image_date.toDateString() ===
          untimed_trips_selected_date.toDateString()
        );
      });

      return {
        date: untimed_trips_selected_date,
        images: images_today.map((image, index) => {
          return {
            ...image,
            index: index,
          };
        }),
      };
    };

    const imagesGroupedForDay = groupImagesByDay(images);

    ////change the selected_image_location to the first image for the day
    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_image_location: imagesGroupedForDay.images[0],
      };
    });

    return groupImagesByDay(images);
  }, [images, trip, untimed_trips_selected_date]);

  const setShowOnMap = (image: Image) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        scroll_to_image: image,
      };
    });
  };

  // add listener to document
  // that when preview image is not selected, and then selected_image_location is not null
  // listens to "ArrowRight" and "ArrowLeft" keydown events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key Down Event HERE');
      console.log(event.key);
      console.log('Selected Image Location', selected_image_location);
      console.log('Viewed Image Index', viewed_image_index);
      if (selected_image_location && viewed_image_index === null) {
        console.log('Selected Image Location', selected_image_location);
        if (event.key === 'ArrowRight') {
          const index = groupedOrderedImagesByDay.images.findIndex(
            (image) => image.id === selected_image_location.id
          );

          if (index < groupedOrderedImagesByDay.images.length - 1) {
            tripViewStore.setState((state) => {
              return {
                ...state,
                selected_image_location:
                  groupedOrderedImagesByDay.images[index + 1],
              };
            });
            scrollToImage(groupedOrderedImagesByDay.images[index]);
          }
        }

        if (event.key === 'ArrowLeft') {
          const index = groupedOrderedImagesByDay.images.findIndex(
            (image) => image.id === selected_image_location.id
          );

          if (index >= 0) {
            tripViewStore.setState((state) => {
              return {
                ...state,
                selected_image_location:
                  groupedOrderedImagesByDay.images[index - 1],
              };
            });
            scrollToImage(groupedOrderedImagesByDay.images[index]);
          }
        }
        //if "i" -> zoom in like clicking map
        if (event.key === 'i') {
          setShowOnMap(selected_image_location);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selected_image_location,
    groupedOrderedImagesByDay,
    viewed_image_index,
    scrollToImage,
  ]);

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
    return <div>Trip Failed To Load {tripLoadingError.message}</div>;
  }

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
    <div className="w-full h-full">
      {/* Make Scrollable */}
      <div className="gallery mt-4 w-full justify-center bg-white dark:bg-black rounded-b-lg shadow-lg border border-gray-300"></div>
      <div className="w-full h-full scrollable-container overflow-y-auto  p-4 bg-white dark:bg-black rounded-b-lg shadow-lg border border-gray-300 ">
        {bannerComponent}
        <GroupImagesByTime
          images={groupedOrderedImagesByDay.images}
          date={groupedOrderedImagesByDay.date}
          //scrollToImage={scrollToImage}
        />
      </div>
      <ImagePreview
        preset_images={{
          preset: true,
          images: groupedOrderedImagesByDay.images,
        }}
      />
    </div>
  );
};

//component that takes in date and list of images, and returns a sub-gallery of images
// provisioned into time ranges

type SubRangeOfImages = {
  start_hour: number; // 0..23
  end_hour: number; // 0..23
  images: Image[];
};

type groupImagesByTimeProps = {
  images: Image[];
  date: Date;
};

export const GroupImagesByTime: React.FC<groupImagesByTimeProps> = ({
  images,
  date,
}) => {
  // group images into SubRangeOfImages
  const { selected_image_location, horizontally_tabbed } = useTripViewStore();

  const deleteImageMutation = useDeleteImage();

  const [editingImageName, setEditingImageName] = useState<Image | null>(null);
  const [editedName, setEditedName] = useState('');

  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQueryTrip(id);

  const editImage = UpdateImage();

  const deleteImage = async (image: Image) => {
    //use mutation to delete image
    const rizzed = await deleteImageMutation.mutate(image);
  };

  const image_id_refs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selected_image_location) {
      const ref = image_id_refs.current[selected_image_location.id];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selected_image_location]);

  const groupedSubRangeImages = (
    images: Image[],
    date: Date
  ): SubRangeOfImages[] => {
    let current_hour = 0;

    //make start_hour to be the hour of the first image
    if (images.length > 0) {
      current_hour = images[0].created_at.getHours();

      //account for time zone shift
    }
    //let start_hour = 0;
    let start_hour = current_hour;

    const list_of_subranges: SubRangeOfImages[] = [];

    while (current_hour < 24) {
      // incriment through hours until adding the next hour would exceed 6 images
      const current_subrange: SubRangeOfImages = {
        start_hour: current_hour,
        end_hour: 0,
        images: [],
      };

      const images_for_hour = images.filter((image) => {
        return image.created_at.getHours() === current_hour;
      });

      //append list of images to current_subrange
      current_subrange.images = current_subrange.images.concat(images_for_hour);
      current_hour += 1;

      let images_for_next_hour = images.filter((image) => {
        return image.created_at.getHours() === current_hour;
      });

      let number_of_images = images_for_hour.length;

      while (number_of_images + images_for_next_hour.length <= 8) {
        current_hour++;
        //append list of images to current_subrange
        current_subrange.images =
          current_subrange.images.concat(images_for_next_hour);

        number_of_images += images_for_next_hour.length;
        images_for_next_hour = images.filter((image) => {
          const passes_filter =
            image.created_at.getHours() === current_hour &&
            image.created_at.toDateString() === date.toDateString();

          return passes_filter;
        });

        //maximum duration of 3 hours
        if (current_hour - start_hour >= 4) {
          break;
        }

        //break if next hour is 24
        if (current_hour === 24) {
          break;
        }
      }

      //if the number of images is 0, then don't add it and go to next iteration
      if (current_subrange.images.length === 0) {
        continue;
      }

      //set end hour as the max of current_hour and the hour of the last image i nth esubrange
      const max_hour =
        current_subrange.images.length > 0
          ? Math.max(
              current_hour,
              current_subrange.images[
                current_subrange.images.length - 1
              ].created_at.getHours()
            )
          : current_hour;

      current_subrange.end_hour = max_hour;
      list_of_subranges.push(current_subrange);
      ///return list_of_subranges;
    }

    return list_of_subranges;
  };

  //use memo to create the list of subranges
  const subranges = useMemo(() => {
    return groupedSubRangeImages(images, date);
  }, [images, date]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  //use store to set the selected image preview and editing image
  const store = tripViewStore;

  const setSelectedImagePreview = (image: Image) => {
    store.setState((state) => {
      return {
        ...state,
        selected_image_preview: image,
      };
    });
  };

  //set editing image
  const setEditingImage = (image: Image) => {
    store.setState((state) => {
      return {
        ...state,
        editingImage: image,
      };
    });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [editingImageName]);

  // set the selected image location
  const setSelectedImageLocation = (image: Image, force = false) => {
    //check if the image is already selected
    if (
      selected_image_location &&
      selected_image_location.id === image.id &&
      !force
    ) {
      tripViewStore.setState((state) => {
        return {
          ...state,
          selected_image_location: null,
        };
      });
      return;
    }

    store.setState((state) => {
      return {
        ...state,
        selected_image_location: image,
      };
    });
  };

  const setPreviewImage = (index: number) => {
    console.log('Preview Image', index);
    console.log('Preview Image Selected', images[index]);

    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: index,
        selected_image_location: images[index],
      };
    });
  };

  const setShowOnMap = (image: Image) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        scroll_to_image: image,
      };
    });
  };

  const handleNameSubmit = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const image = editingImageName;

    if (!image) return;
    if (!trip) return;

    const new_image = await editImage.mutateAsync({
      image: {
        ...image,
        id: image.id,
        name: editedName,
      },
      trip: trip,
    });

    setEditingImageName(null);
    setEditedName('');
  };

  //return gallery based on subranges
  return (
    <div className="p-4 dark:bg-black">
      {subranges.map((subrange) => {
        const startHour = new Date(subrange.start_hour).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const endHour = new Date(subrange.end_hour).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={date.toDateString() + subrange.start_hour} className="mb-4">
            <div className="text-lg font-semibold mb-2">
              {subrange.start_hour > 12
                ? `${subrange.start_hour - 12}PM`
                : `${subrange.start_hour}AM`}{' '}
              -{' '}
              {subrange.end_hour > 12
                ? `${subrange.end_hour - 12}PM`
                : `${subrange.end_hour}AM`}
            </div>
            <div className="flex flex-wrap flex-row justify-around items-center gap-y-1">
              {subrange.images.map((image, i) => {
                return (
                  <div
                    key={image.id}
                    className={`relative flex flex-col  h-100% bg-white rounded-lg shadow-lg border border-gray-300 min-w-[200]  ${
                      selected_image_location?.id === image.id
                        ? 'border-8 border-blue-800 dark:border-neon-purple'
                        : 'border-2 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div
                      key={image.id}
                      style={{
                        width: '250px',
                      }}
                      className="relative w-full h-full flex flex-col  p-4 bg-white rounded-lg shadow-lg border border-gray-300 h-[300px] w-[220px]"
                    >
                      <div
                        onClick={() => setSelectedImageLocation(image)}
                        ref={(el) => {
                          image_id_refs.current[image.id] = el;
                        }}
                        className="relative flex flex-grow items-center justify-center bg-gray-100 border h-[200px] w-[200px]"
                      >
                        <NextImage
                          src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                          alt={`Image for ${image.created_at}`}
                          height={200}
                          width={200}
                          className=" rounded-lg"
                          style={{
                            cursor: 'pointer',
                            //allign self to center
                            justifySelf: 'flex-end',
                            maxHeight: '200px',
                            maxWidth: '200px',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <div className="absolute top-1 right-1 flex ">
                        <AiFillDelete
                          onClick={() => deleteImage(image)}
                          className="cursor-pointer dark:text-red-500 "
                          size={30}
                          style={{ marginRight: '10px' }}
                        />
                        <HiOutlinePencil
                          onClick={() => setEditingImage(image)}
                          className="cursor-pointer dark:text-blue-800 font-semibold"
                          size={30}
                          style={{ marginRight: '10px' }}
                        />
                        <HiEye
                          onClick={() =>
                            setPreviewImage(
                              images.findIndex((img) => img.id === image.id)
                            )
                          }
                          className="cursor-pointer dark:text-blue-800 font-semibold"
                          size={30}
                        />
                        <HiMap
                          onClick={() => {
                            setSelectedImageLocation(image, true);
                            setShowOnMap(image);
                          }}
                          className="cursor-pointer ml-2 dark:text-black font-semibold"
                          size={30}
                        />
                      </div>
                      <div className="mt-2 text-center text-sm font-medium text-gray-700 justify-self-end">
                        {editingImageName &&
                        editingImageName.id === image.id ? (
                          <textarea
                            ref={inputRef}
                            value={editedName}
                            onChange={(event) =>
                              setEditedName(event.target.value)
                            }
                            onBlur={() => {
                              setEditingImageName(null);
                              setEditedName('');
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                //use the mutation to update the image name
                                handleNameSubmit(event);
                              }
                              if (event.key === 'Escape') {
                                setEditedName('');
                                setEditingImageName(null);
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-row">
                            <p className="w-[80%]">{image.name}</p>
                            <FaPencil
                              size={20}
                              onClick={() => {
                                setEditingImageName(image);
                                setEditedName(image.name);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <EditImageForm />
          </div>
        );
      })}
    </div>
  );
};

export default Image_View_ByDateUntimed;
