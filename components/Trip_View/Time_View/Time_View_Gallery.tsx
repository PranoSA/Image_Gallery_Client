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
import { useContext, useMemo, useRef, useEffect } from 'react';
import {
  tripViewStore,
  useDeleteImage,
  useQueryTrip,
  useQueryTripImages,
  useTripViewStore,
} from '../Trip_View_Image_Store';
import TripContext from '@/components/TripContext';
import { useQuery } from '@tanstack/react-query';
import FilteredCategoryForm from '@/components/Trip_View/FilteredCategoryForm';

import ImagePreview from '../ImagePreview';

import { HiOutlinePencil, HiEye } from 'react-icons/hi';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import { Image } from '@/definitions/Trip_View';
import NextImage from 'next/image';

import EditImageForm from '../EditImageForm';

//Trash Icon for deletion
import { AiFillDelete } from 'react-icons/ai';

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

  type ImagesByDay = {
    date: Date;
    images: Image[];
  };

  // Create refs for each date
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const groupedOrderedImagesByDay = useMemo(() => {
    const groupImagesByDay = (images: Image[] | undefined) => {
      const grouped: ImagesByDay[] = [];

      if (!trip) return [];
      if (!images) return [];

      //iterate through dates of trip
      const start_date = new Date(trip.start_date);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(trip.end_date);
      end_date.setHours(23, 59, 59, 999);

      let current_date = new Date(trip.start_date);

      while (current_date.getTime() <= end_date.getTime()) {
        const imagesForDay = images
          .filter((image) => {
            return (
              new Date(image.created_at).toDateString() ===
              current_date.toDateString()
            );
          })
          .filter((image) => {
            return !filtered_categories.includes(image.category || '');
          })
          .sort((a, b) => {
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          });
        /*const imagesForDay = get_images_for_day(
          selected_date,
          trip?.start_date,
          images
        );
        */

        //push to the images for the day
        if (imagesForDay.length > -1) {
          grouped.push({
            date: new Date(current_date),
            images: imagesForDay,
          });
        }
        current_date.setDate(current_date.getDate() + 1);
      }

      return grouped;
    };

    return groupImagesByDay(images);
  }, [filtered_categories, images, trip]);

  const selectedDate = useMemo(() => {
    if (!trip) return new Date().toISOString();

    // Parse the start date as UTC
    const startDate = new Date(
      Date.UTC(
        new Date(trip.start_date).getUTCFullYear(),
        new Date(trip.start_date).getUTCMonth(),
        new Date(trip.start_date).getUTCDate()
      )
    );

    // Add selected_date days to the start date
    startDate.setUTCDate(startDate.getUTCDate() + selected_date);

    // Return the date as a UTC timestamp string

    //Thu, 19 Oct 2023 00:00:00 GMT
    //Split after the 2023, 2022, 2024,  etc. and remove comma

    //Thu Oct 19 2023
    //this is the formatt I want it in

    //get the Day of the week, Month, Day, Year

    const day = startDate.toUTCString().split(' ')[0].replace(',', '');
    const month = startDate.toUTCString().split(' ')[1];
    const date = startDate.toUTCString().split(' ')[2];
    const year = startDate.toUTCString().split(' ')[3];

    return `${day} ${date} ${month} ${year}`;
  }, [trip, selected_date]);

  const setSelectedDate = (date: string | null) => {
    if (!date) return;
    if (!trip) return;

    //create utc date from date string

    const newDate = new Date(date);
    const startDate = new Date(trip.start_date);
    const selectedDate =
      (newDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_date: Math.floor(selectedDate),
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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const containerTop = event.currentTarget.getBoundingClientRect().top;
    const threshold = 50; // Adjust this value as needed
    let closestDate: string | null = null;

    Object.keys(dateRefs.current).forEach((date) => {
      const ref = dateRefs.current[date];
      if (ref) {
        const refTop = ref.getBoundingClientRect().top;
        if (
          refTop - containerTop < threshold &&
          refTop - containerTop > -threshold
        ) {
          closestDate = date;
        }
      }
    });
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
    <div className="w-full h-full">
      <ImagePreview />
      <div className="w-full overflow-x-auto" style={{ flexShrink: 0 }}>
        <div className="scrollmenu" ref={scrollContainerRef}>
          <ul className="inline-flex space-x-4 bg-gray-200 p-2 rounded-t-lg border-b border-gray-300">
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
                onClick={() => scrollToGroup(group.date.toDateString())}
              >
                {group.date.toDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="scrollable-container overflow-y-auto h-full p-4 bg-white rounded-b-lg shadow-lg border border-gray-300"
        onScroll={handleScroll}
      >
        {groupedOrderedImagesByDay.map((group) => {
          return (
            <div
              key={group.date.toDateString()}
              ref={(el) => {
                dateRefs.current[group.date.toDateString()] = el;
              }}
              className="mb-4"
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

  // set the selected image location
  const setSelectedImageLocation = (image: Image) => {
    //check if the image is already selected
    if (selected_image_location && selected_image_location.id === image.id) {
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

  //return gallery based on subranges
  return (
    <div className="p-4">
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
                    className={`relative flex flex-col  h-100% ${
                      horizontally_tabbed ? 'w-1/2 xl:w-1/4' : 'w-1/2 xl:w-1/4'
                    } bg-white rounded-lg shadow-lg border border-gray-300 min-w-[200]`}
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
                      className="relative w-full h-full flex flex-col  p-4 bg-white rounded-lg shadow-lg border border-gray-300"
                    >
                      <div
                        onClick={() => setSelectedImageLocation(image)}
                        className="relative flex flex-grow items-center justify-center bg-gray-100 p-1 border h-[200px]  "
                      >
                        <NextImage
                          src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                          alt={`Image for ${image.created_at}`}
                          width={164}
                          height={164}
                          className="object-contain rounded-lg"
                          style={{
                            cursor: 'pointer',
                            margin: '10px',
                            //allign self to center
                            justifySelf: 'flex-end',
                          }}
                        />
                      </div>
                      <div className="absolute top-1 right-1 flex ">
                        <AiFillDelete
                          onClick={() => deleteImage(image)}
                          className="cursor-pointer"
                          size={24}
                          style={{ marginRight: '10px' }}
                        />
                        <HiOutlinePencil
                          onClick={() => setEditingImage(image)}
                          className="cursor-pointer"
                          size={24}
                          style={{ marginRight: '10px' }}
                        />
                        <HiEye
                          onClick={() => setPreviewImage(i)}
                          className="cursor-pointer"
                          size={24}
                        />
                      </div>
                      <div className="mt-2 text-center text-sm font-medium text-gray-700">
                        {image.name}
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
