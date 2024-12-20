/**
 *
 * Plain View Will Come With 3 Options
 *
 * 1. No Categories [All Images Shown]
 * 2. Only Categories [Shows Images as Folders and Images in the Folders]
 * 3. Categories and Uncategorised Images [Shows Images as Folders and Images in the Folders]
 *
 */

import { useContext, useState, useMemo, useRef, useEffect } from 'react';
import {
  useQueryTripImages,
  useQueryTrip,
  useDeleteImage,
  UpdateImage,
  useQueryDaySummaries,
  useQueryDaySummary,
  useUpdateDaySummary,
  updateDaySummaryMutation,
} from '../Trip_View_Image_Store';
import TripContext from '@/components/TripContext';
import { useTripViewStore, tripViewStore } from '../Trip_View_Image_Store';
import { Banner_Component } from '../Banner_Component';
import EditImageForm from '../EditImageForm';
import NextImage from 'next/image';
import { Image, Trip, DaySummary } from '@/definitions/Trip_View';
import { AiFillDelete } from 'react-icons/ai';

import { HiEye, HiOutlinePencil } from 'react-icons/hi';
import ImagePreview from '../ImagePreview';
import { FaPencil } from 'react-icons/fa6';

import { FaCheck, FaPen, FaTimes } from 'react-icons/fa';
//Download Icon
import { FaDownload } from 'react-icons/fa';

type PlainViewProps = {
  show_selection?: boolean;
};

const PlainView: React.FC<PlainViewProps> = ({ show_selection = false }) => {
  const [mode, setMode] = useState<
    'no_categories' | 'only_categories' | 'categories_and_uncategorised'
  >('no_categories');

  const id = useContext(TripContext).id;

  const {
    data: images,
    isLoading: imagesLoading,
    isError: imagesError,
  } = useQueryTripImages(id);

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQueryTrip(id);

  const { selected_date, selected_images } = useTripViewStore();

  //Create a LARGE Immage Gallery With All Images
  //It will be separated by day and by time like before
  //but do not include days without images

  type IndexedImage = Image & { index: number };

  const {
    data: getDaySummaries,
    isLoading: getDaySummariesLoading,
    isError: getDaySummariesError,
  } = useQueryDaySummaries(id);

  const updateDaySummary = useUpdateDaySummary();

  const modifyDaySummary = async (summary: string, date: Date) => {
    //convert to date string YYYY-MM-DD
    const date_string = date.toISOString().split('T')[0];

    if (!trip) return;

    const days_from_beggining =
      new Date(trip?.start_date).getTime() - date.getTime();

    const days_elapsed = days_from_beggining / (1000 * 3600 * 24);

    if (!getDaySummaries) return;

    //get the day summary for the date
    const day_summary = getDaySummaries?.find((day_summary) => {
      return day_summary.day === date_string;
    });

    if (!day_summary) return;

    const new_day_summary: DaySummary = {
      ...day_summary,
      summary,
    };

    updateDaySummary.mutate({
      summary: new_day_summary,
      new_text: summary,
    });
  };

  type ImagesByDay = {
    date: Date;
    images: IndexedImage[];
  };

  const groupedOrderedImagesByDay = useMemo(() => {
    const groupImagesByDay = (
      images: Image[] | undefined,
      selected_date: number
    ) => {
      const grouped: ImagesByDay = {
        date: new Date(),
        images: [],
      };

      if (!trip) return grouped;
      if (!images) return grouped;

      //iterate through dates of trip
      const start_date = new Date(trip.start_date);

      start_date.setDate(start_date.getDate() + selected_date);
      const end_date = new Date(trip.start_date);
      //add offset from UTC in current time-zoen - to accurately translate what it isin== UTC to the current time zone
      const offset_minutes = start_date.getTimezoneOffset();
      start_date.setMinutes(start_date.getMinutes() + offset_minutes);

      end_date.setHours(23, 59, 59, 999);
      end_date.setMinutes(end_date.getMinutes() + offset_minutes);

      const start_index = images.findIndex((image) => {
        return new Date(image.created_at) >= start_date;
      });

      const imagesForDay = images
        .filter((image) => {
          return (
            new Date(image.created_at).toDateString() ===
            start_date.toDateString()
          );
        })
        .sort((a, b) => {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });

      grouped.date = start_date;
      grouped.images = imagesForDay.map((image, index) => {
        return {
          ...image,
          index: index + start_index,
        };
      });

      return grouped;
    };
    //1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 , etc.
    // the legnth is trip.end_date - trip.start_date
    if (!trip) return [];
    const current_days_m = Math.floor(
      (new Date(trip.end_date).getTime() -
        new Date(trip.start_date).getTime()) /
        (1000 * 3600 * 24)
    );

    console.log('# OF DAYS', current_days_m);
    //now do 0,1,2,3,4 -> current_days_m-1
    const current_days = Array.from(
      { length: current_days_m + 1 },
      (_, i) => i
    );

    return current_days.map((day) => {
      return groupImagesByDay(images, day);
    });
  }, [images, trip]);

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

  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      <ImagePreview
        //set in zoom should scroll to the image
        setInZoom={(image: Image) => {
          if (!images) return;
          // scroll to that image here
          const index = images.findIndex((i) => i.id === image.id);
          if (index === -1) return;

          const date = images[index].created_at.toDateString();

          const ref = dateRefs.current[date];

          if (ref) {
            ref.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      <div className="w-full overflow-x-auto" style={{ flexShrink: 0 }}>
        <div className="scrollmenu" ref={scrollContainerRef}>
          <ul className="inline-flex space-x-4 bg-gray-200 p-2 rounded-t-lg border-b border-gray-300 dark:bg-black">
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
                    ? 'bg-gray-400 text-white !important dark:bg-gray-100 '
                    : 'bg-white text-black hover:bg-gray-100 dark:bg-black dark:bg-gray-400 dark:color-white'
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
        className="scrollable-container overflow-y-auto h-full p-4 bg-white dark:bg-black rounded-b-lg shadow-lg border border-gray-300"
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
              <GroupImagesByTime
                images={group.images}
                date={group.date}
                show_selection={show_selection}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

type SubRangeOfImages = {
  start_hour: number; // 0..23
  end_hour: number; // 0..23
  images: (Image & { index: number })[];
};

type groupImagesByTimeProps = {
  images: (Image & { index: number })[];
  date: Date;
  show_selection?: boolean;
};

export const GroupImagesByTime: React.FC<groupImagesByTimeProps> = ({
  images,
  date,
  show_selection = false,
}) => {
  // group images into SubRangeOfImages
  const { selected_image_location, horizontally_tabbed, selected_images } =
    useTripViewStore();

  const deleteImageMutation = useDeleteImage();

  const editImage = UpdateImage();

  const [editingName, setEditingName] = useState<Image | null>(null);
  const [editedName, setEditedName] = useState('');

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editedDateSummary, setEditedDateSummary] = useState('');

  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQueryTrip(id);

  const {
    data: daySummaries,
    isLoading: daySummariesLoading,
    isError: daySummariesError,
  } = useQueryDaySummaries(id);

  const submitNewName = async () => {
    if (!editingName) return;

    if (!editedName) return; //this should
    if (!trip) return;
    const new_image = {
      ...editingName,
      name: editedName,
    };

    const res = await editImage.mutate({ image: new_image, trip });

    setEditingName(null);

    setEditedName('');
  };

  const updateDaySummary = useUpdateDaySummary();

  const submitNewDaySummary = async (summary: string) => {
    if (!editingDate) return;

    if (!trip) return;

    //ensure that the date is in the correct format
    //YYYY-MM-DD
    const regex = /\d{4}-\d{2}-\d{2}/;

    console.log('Editing Date', editingDate);

    if (!regex.test(editingDate)) {
      console.log('SSSSSSSSSSSSSSSSSSSSSSSS INCORRECT FORMAT');
      return;
    }

    const new_summary: DaySummary = {
      day: editingDate,
      summary: editedDateSummary,
      tripid: id,
    };

    const res = await updateDaySummary.mutate({
      summary: new_summary,
      new_text: summary,
    });

    setEditingDate(null);
    setEditedDateSummary('');
  };

  const deleteImage = async (image: Image) => {
    //use mutation to delete image
    const rizzed = await deleteImageMutation.mutate(image);
  };

  const groupedSubRangeImages = (
    images: (Image & { index: number })[],
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
  //use memo to create the list of subranges
  const subranges = useMemo(() => {
    return groupedSubRangeImages(images, date);
  }, [images, date]);

  //use store to set the selected image preview and editing image
  const store = tripViewStore;

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

  const inputRef = useRef(null);

  /*  useEffect(() => {
     if (editingName=== image.id) {
      inputRef.current.focus();
    }
  }, [editedImage, image.id]);
*/
  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Escape') {
      setEditedName('');
      setEditingName(null);
      setEditedDateSummary('');
      setEditingDate(null);
    } else if (e.key === 'Enter') {
      if (editingName) {
        await submitNewName();

        setEditedName('');
        setEditingName(null);
      }
      if (editingDate) {
        await submitNewDaySummary(editedDateSummary);
        setEditedDateSummary('');
        setEditingDate(null);
      }
    }
  };

  const handleBlur = () => {
    submitNewName();
    setEditedName('');
    setEditingName(null);
  };

  const handleBlurDaySummary = () => {
    submitNewDaySummary(editedDateSummary);
    setEditedDateSummary('');
    setEditingDate(null);
  };

  const find_day_summary_by_date = (date: Date) => {
    const day_summary = daySummaries?.find((day_summary) => {
      //YYYY-MM-DD
      const date_string = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate()}`;

      return day_summary.day.split('T')[0] === date_string;
    });
    if (day_summary) {
      return day_summary.summary;
    }
    return '';
  };

  const date_string_today = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  //return gallery based on subranges
  return (
    <div className="p-4">
      <div className="text-2xl font-bold mb-4">
        {date.toDateString()}
        <div className="text-2xl font-bold mb-4">
          {editingDate === date_string_today ? (
            <div>
              <textarea
                value={editedDateSummary}
                onChange={(e) => setEditedDateSummary(e.target.value)}
                className="w-full h-40 p-4 max-w-2xl"
                onBlur={handleBlurDaySummary}
                onKeyDown={handleKeyDown}
              ></textarea>
            </div>
          ) : (
            <>
              {find_day_summary_by_date(date)}
              <FaPencil
                onClick={() => {
                  setEditedDateSummary(find_day_summary_by_date(date));
                  console.log('Date Editing', date);
                  console.log('Date Editing', date.toISOString());
                  const date_Event = `${date.getFullYear()}-${(
                    date.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, '0')}-${date
                    .getDate()
                    .toString()
                    .padStart(2, '0')}`;

                  console.log('Date Editingsss', date_Event);
                  setEditingDate(date_Event);
                }}
                className="cursor-pointer"
              />
            </>
          )}
        </div>
      </div>
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
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              }}
            >
              {subrange.images.map((image, i) => {
                const isSelected =
                  show_selection && selected_images.includes(image);
                const borderClass = isSelected
                  ? 'border-4 border-blue-500'
                  : 'border border-gray-300';
                return (
                  <div
                    key={image.id}
                    className="relative flex flex-col items-center justify-end bg-white rounded-lg shadow-lg border border-gray-300"
                  >
                    <div
                      onClick={() => {
                        if (show_selection) {
                          const currently_select: boolean =
                            selected_images.includes(image);

                          if (currently_select) {
                            tripViewStore.setState((state) => {
                              return {
                                ...state,
                                selected_images: state.selected_images.filter(
                                  (selected_image) =>
                                    selected_image.id !== image.id
                                ),
                              };
                            });
                          } else {
                            tripViewStore.setState((state) => {
                              return {
                                ...state,
                                selected_images: [
                                  ...state.selected_images,
                                  image,
                                ],
                              };
                            });
                          }
                        } else {
                          setPreviewImage(image.index);
                        }
                      }}
                      className={`w-full flex items-center justify-center bg-gray-100 p-1 min-h-[500px] ${borderClass}`}
                    >
                      {' '}
                      <div className="relative w-full dark:bg-black h-full flex items-center justify-center max-w-full max-h-[500px]">
                        <NextImage
                          src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                          alt={`Image for ${image.created_at}`}
                          sizes="(max-width: 500px) 100vw, 500px"
                          onLoad={(e) => {
                            console.log('Image Loaded', e);
                          }}
                          onLoadStart={(e) => {
                            console.log('Image Loading', e);
                          }}
                          onLoadedMetadata={(e) => {
                            console.log('Image MetaData', e);
                          }}
                          layout="fill"
                          className="object-contain rounded-lg"
                          style={{
                            cursor: 'pointer',
                            objectFit: 'contain',
                          }}
                          ///contain
                          objectFit="contain"
                        />
                      </div>
                    </div>
                    <div className="absolute top-1 right-1 flex">
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
                        onClick={() => setPreviewImage(image.index)}
                        className="cursor-pointer"
                        size={24}
                      />
                      <FaDownload
                        onClick={async () => {
                          window.open(
                            `${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}?download=true`
                          );
                        }}
                        className="cursor-pointer"
                        size={24}
                        style={{ marginLeft: '10px' }}
                      />
                    </div>
                    <div className="mt-2 text-center text-sm font-bold text-gray-700">
                      {editingName && editingName.id === image.id ? (
                        <div className="flex items-center justify-center">
                          <input
                            ref={inputRef}
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            className="border border-gray-300 rounded p-1"
                          />
                          <FaCheck
                            onClick={() => {
                              //saveName(image.id, editedName);
                              //setEditedImage(null);
                              submitNewName();
                            }}
                            className="cursor-pointer ml-2"
                            size={16}
                          />
                          <FaTimes
                            onClick={() => {
                              setEditingName(null);
                              setEditedName('');
                            }}
                            className="cursor-pointer ml-2"
                            size={16}
                          />
                        </div>
                      ) : (
                        <div className="w-full flex flex-width justify-around">
                          {image.name}{' '}
                          <FaPencil
                            onClick={() => setEditingName(image)}
                            className="cursor-pointer ml-4"
                            size={16}
                          />
                        </div>
                      )}
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      <span> {image.created_at.toDateString()} </span>
                      {image.created_at.getHours() > 12
                        ? (image.created_at.getHours() - 12)
                            .toString()
                            .padStart(2, '0')
                        : image.created_at
                            .getHours()
                            .toString()
                            .padStart(2, '0')}
                      :
                      {image.created_at
                        .getMinutes()
                        .toLocaleString()
                        .padStart(2, '0')}
                      {image.created_at.getHours() > 12 ? ' PM' : ' AM'}:
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

export default PlainView;
