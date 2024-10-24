'use client';
/**
 *
 *
 * This component is responsible for displaying the images of the trip.
 *
 * But in a timed order
 *
 * The way to do this is sort images by created_at
 * Then between each day - write the day
 *
 * Also, if more than 6 images in a day, then write an hour time-range that encapsulates the images
 *
 * Make the widget scrollable
 *
 * The time ranges should encapsulate 6 images - but can encapsulate more or less depending on
 *
 * Here is the algorithm, split on the hours according to the largest hour that encapsulates 6 images
 *
 * 1. Needs to be in hour increments, so if 4pm-5pm entailed more than 6 photos, then 4pm to 5pm is fine
 * 2. If 4pm - 6pm has 9 photos, then split them up into 4pm-5pm and 5pm-6pm
 * 3. If 4pm - 6pm has 5 photos, and 4pm -7pm has 6 photos, then it should be 4pm-7pm
 * 4. if 4pm-7pm has 5 photos and 4pm-8pm has 7 photos, should be 4pm-7pm and then apply the logic starting at7pm
 *
 *
 * Also when you click an image - it should selected the selected_image_location in the store
 * When you click the "eye" icon, it should set the selected_image_preview in the store
 * When you click the edit icon, it should set the editingImage in the store
 */

import '@/globals.css';
import { timeFromString } from '../Time_Functions';
import { useContext, useMemo, useRef, useEffect, useState } from 'react';
import {
  tripViewStore,
  UpdateImage,
  useDeleteImage,
  useQueryTrip,
  useQueryTripImages,
  useTripViewStore,
} from '../Trip_View_Image_Store';
import TripContext from '@/components/TripContext';
import { useQuery } from '@tanstack/react-query';
import FilteredCategoryForm from '@/components/Trip_View/FilteredCategoryForm';

import ImagePreview from '../ImagePreview';

import { HiOutlinePencil, HiEye, HiMap } from 'react-icons/hi';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import { Image } from '@/definitions/Trip_View';
import NextImage from 'next/image';

import EditImageForm from '../EditImageForm';

//Trash Icon for deletion
import { AiFillDelete } from 'react-icons/ai';
import {
  CompareViewStore,
  useCompareViewStore,
} from '../Compare_View/CompareStore';
import { FaPencil } from 'react-icons/fa6';

const TimeViewGallery: React.FC = () => {
  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripLoading,
    isLoadingError: tripError,
  } = useQueryTrip(id);

  const {
    data: images,
    isLoading: imagesLoading,
    isLoadingError: imagesError,
  } = useQueryTripImages(id);

  const {
    selected_date,
    selected_image_location,
    filtered_categories,
    horizontally_tabbed,
    get_images_for_day,
  } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  type ImagesByDay = {
    date: Date;
    images: Image[];
  };

  // Create refs for each date
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const candidate_dates = useMemo(() => {
    //Pretty much, return a list of every unique date in the images

    const unique_dates: Date[] = [];

    if (!images) return [];

    const filtered_images = images.filter((image) => {
      return !filtered_categories.includes(image.category || '');
    });

    if (filtered_images.length === 0) return [];

    let last_saw_date = new Date(filtered_images[0].created_at);

    unique_dates.push(last_saw_date);

    images
      .filter((image) => {
        return !filtered_categories.includes(image.category || '');
      })
      .forEach((image) => {
        const current_date = new Date(image.created_at);

        if (current_date.toDateString() !== last_saw_date.toDateString()) {
          unique_dates.push(current_date);
          last_saw_date = current_date;
        }
      });

    return unique_dates;
  }, [filtered_categories, images]);

  const groupedOrderedImagesByDay: ImagesByDay[] = useMemo(() => {
    const groupImagesByDay = (images: Image[] | undefined) => {
      const grouped: ImagesByDay = {
        date: new Date(),
        images: [],
      };

      if (!trip) return [];
      if (!images) return [];

      let current_index = 0;
      //iterate through candidate dates
      const imagesByDate: ImagesByDay[] = candidate_dates.map((date) => {
        /*
    return images.filter((image) => {
      const image_date = new Date(image.created_at);
      return image_date.toDateString() === date.toDateString();
    });
        */
        const imagesForDay = images
          .filter((image) => {
            const image_date = new Date(image.created_at);
            return image_date.toDateString() === date.toDateString();
          })
          .filter((image) => {
            //make sure it is not one of the filtered categories
            return !filtered_categories.includes(image.category || '');
          });
        const newr = imagesForDay.map((image, index) => {
          return {
            ...image,
            index: index + current_index,
          };
        });
        current_index += imagesForDay.length;

        const newton: ImagesByDay = {
          date: date,
          images: newr,
        };

        return newton;
      });
      return imagesByDate;
    };

    return groupImagesByDay(images);
  }, [candidate_dates, images, trip, filtered_categories]);

  const selectedDate = useMemo(() => {
    if (!trip) return new Date().toDateString();

    return untimed_trips_selected_date.toDateString();
  }, [trip, untimed_trips_selected_date]);

  const setSelectedDate = (date: string | null) => {
    if (!date) return;
    if (!trip) return;

    //since this is untimed -> set untimed_selected_date in compare view store

    const new_date = new Date(date);

    CompareViewStore.setState((state) => {
      return {
        ...state,
        untimed_trips_selected_date: new_date,
      };
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (selectedDate && dateRefs.current[selectedDate]) {
      dateRefs.current[selectedDate].scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    }
  }, [selectedDate]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const containerTop = event.currentTarget.getBoundingClientRect().top;
    const threshold = 50; // Adjust this value as needed
    let closestDate: string | null = null;

    console.log('DateRefs', dateRefs.current);

    const closest_distance = 1000000;

    Object.keys(dateRefs.current).forEach((date) => {
      const ref = dateRefs.current[date];
      console.log('Ref', ref);
      if (ref) {
        const refTop = ref.getBoundingClientRect().top;
        console.log('RefTop', refTop);
        console.log('ContainerTop', containerTop);
        if (
          refTop - containerTop < threshold &&
          refTop - containerTop > -threshold
        ) {
          closestDate = date;
          console.log('Closest Date Date', closestDate);
          console.log("Closest Div's Top", refTop);
        }
      }
    });
    console.log('Closest Date', closestDate);
    //add a day to the selected date
    setSelectedDate(closestDate);
  };
  const selectedDateRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (selectedDateRef.current) {
      selectedDateRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [selectedDate]);

  if (tripLoading || imagesLoading) {
    return <div>Loading...</div>;
  }

  if (tripError) {
    return <div>Error loading trip</div>;
  }

  if (imagesError) {
    return <div>Error loading images</div>;
  }

  // Scroll to the corresponding date
  const scrollToGroup = (date: string) => {
    const ref = dateRefs.current[date];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Now Render the described UI
  // Now Render the described UI

  return (
    <div
      className="w-full h-full flex-wrap max-h-full flex overflow-auto "
      id="number1"
    >
      <ImagePreview />
      <div
        className="w-full overflow-x-auto"
        id="number2"
        style={{ height: '72px' }}
      >
        <div className="scrollmenu" ref={scrollContainerRef}>
          <ul className="inline-flex space-x-4 bg-gray-200 p-2 rounded-t-lg  border-gray-300">
            {groupedOrderedImagesByDay.map((group) => (
              <li
                key={group.date.toDateString()}
                ref={
                  selectedDate === group.date.toDateString()
                    ? selectedDateRef
                    : null
                }
                className={`cursor-pointer px-4 py-2 rounded-lg shadow-md transition-colors ${
                  selectedDate === group.date.toDateString()
                    ? 'bg-gray-400 text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => {
                  //scrollToGroup(group.date.toDateString() -> doesn't work -- to long scrolling
                  setSelectedDate(group.date.toDateString());
                }}
              >
                {group.date.toDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* max height is number1 - number2*/}
      <div
        className={`${
          horizontally_tabbed ? '' : ''
        } overflow-y-auto p-4 bg-white rounded-b-lg shadow-lg border-gray-300 w-full`}
        onScroll={handleScroll}
        //if horizontally tabbed, do height = calc(100% - 100px), if not - do not set the height
        //do not set ANY height with ANY string
        // there should be no "height" property if not horizontally tabbed
        // NO!!! DO NOT PUT height "" if not horizontally tabbed
        // it should not be in the first place
        style={{
          height: 'calc(100% - 72px)',
        }}
      >
        {groupedOrderedImagesByDay.map((group) => {
          return (
            <div
              key={group.date.toDateString()}
              ref={(el) => {
                dateRefs.current[group.date.toDateString()] = el;
              }}
              className=""
            >
              <GroupImagesByTime images={group.images} date={group.date} />
            </div>
          );
        })}
      </div>
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
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: index,
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
      <div className="text-2xl font-bold mb-4">{date.toDateString()}</div>
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
                    className={`relative flex flex-col  h-100% bg-white rounded-lg shadow-lg border border-gray-300 min-w-[200]`}
                    style={{
                      border:
                        selected_image_location &&
                        selected_image_location.id === image.id
                          ? '5px solid blue'
                          : 'none',
                    }}
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

export default TimeViewGallery;
