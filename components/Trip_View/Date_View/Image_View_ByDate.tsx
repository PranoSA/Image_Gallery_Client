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
import { useState, useContext, useMemo } from 'react';

import EditImageForm from '@/components/Trip_View/EditImageForm';
import ImagePreview from '@/components/Trip_View/ImagePreview';

import TripContext from '@/components/TripContext';

import {
  dateFromString,
  timeFromString,
} from '@/components/Trip_View/Time_Functions';

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

  const selectedDate = useMemo<Date>(() => {
    //const start_date = new Date(trip?.start_date || '1970-01-01');
    const start_date = dateFromString(trip?.start_date || '1970-01-01');
    //forcibly move the date to UTC - so extrapolate the
    start_date.setDate(start_date.getDate() + selected_date);

    return start_date;
  }, [selected_date, trip]);

  type ImagesByDay = {
    date: Date;
    images: Image[];
  };

  const groupedOrderedImagesByDay = useMemo(() => {
    const groupImagesByDay = (images: Image[] | undefined) => {
      const grouped: ImagesByDay[] = [];

      if (!trip) return [];
      if (!images) return [];

      //here is what we want to do -----

      // get the selected date
      // add 24 hours to the selected date

      //for each image, transform the created_at to a time using the timeFromString function
      // that I built

      // return images that are between the selected date and the selected date + 24 hours

      const selectedDate = dateFromString(trip.start_date);
      selectedDate.setDate(selectedDate.getDate() + selected_date);

      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);

      //now  use get images for day to get the images for the selected date
      const imagesForSelectedDate = get_images_for_day(
        selected_date,
        trip.start_date,
        images
      );

      console.log(
        'images for child component from parent',
        imagesForSelectedDate
      );

      return [
        {
          date: selectedDate,
          images: imagesForSelectedDate,
        },
      ];
    };
    return groupImagesByDay(images);
  }, [images, trip, selected_date, selectedDate]);

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
      {/* Make Scrollable */}
      <div className="gallery mt-4">
        {/* {imagesForDay.map((image, i) => (
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
        ))}*/}
      </div>
      <div className="scrollable-container overflow-y-auto h-96 p-4 bg-white rounded-b-lg shadow-lg border border-gray-300">
        <GroupImagesByTime
          images={groupedOrderedImagesByDay[0].images}
          date={groupedOrderedImagesByDay[0].date}
        />
      </div>
      <ImagePreview />
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

const GroupImagesByTime: React.FC<groupImagesByTimeProps> = ({
  images,
  date,
}) => {
  // group images into SubRangeOfImages
  const { selected_image_location } = useTripViewStore();

  console.log('images child component', images);

  const groupedSubRangeImages = (
    images: Image[],
    date: Date
  ): SubRangeOfImages[] => {
    let current_hour = 0;

    //make start_hour to be the hour of the first image
    if (images.length > 0) {
      current_hour = new Date(
        //getDateAtLocalTime(images[0].created_at)
        timeFromString(images[0].created_at)
      ).getHours();
      //subtract offset
    }
    //let start_hour = 0;
    let start_hour = current_hour;

    const list_of_subranges: SubRangeOfImages[] = [];

    //find hour of id=199
    const image_199 = images.filter((image) => parseInt(image.id) === 199);
    if (image_199.length > 0) {
      console.log(
        'subrange id =199 hour is',
        timeFromString(image_199[0].created_at).getHours()
      );
    }
    while (current_hour < 24) {
      // incriment through hours until adding the next hour would exceed 6 images
      const current_subrange: SubRangeOfImages = {
        start_hour: current_hour,
        end_hour: 0,
        images: [],
      };

      const images_for_hour = images.filter((image) => {
        return timeFromString(image.created_at).getHours() === current_hour;
      });

      //append list of images to current_subrange
      current_subrange.images = current_subrange.images.concat(images_for_hour);
      current_hour += 1;

      let images_for_next_hour = images.filter((image) => {
        return timeFromString(image.created_at).getHours() === current_hour;
      });

      let number_of_images = images_for_hour.length;

      while (number_of_images + images_for_next_hour.length <= 6) {
        current_hour++;
        //append list of images to current_subrange
        current_subrange.images =
          current_subrange.images.concat(images_for_next_hour);

        //print if images_for_next_hour contains id=199
        if (
          images_for_next_hour.filter((image) => parseInt(image.id) === 199)
            .length > 0
        ) {
          console.log('subrange images for next hour', images_for_next_hour);
        }

        number_of_images += images_for_next_hour.length;
        images_for_next_hour = images.filter((image) => {
          const passes_filter =
            timeFromString(image.created_at).getHours() === current_hour;

          //print if images_for_next_hour contains id=199
          if (
            images_for_next_hour.filter((image) => parseInt(image.id) === 199)
              .length > 0
          ) {
            console.log(
              'subrange images for next hou 2r',
              images_for_next_hour
            );
          }

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
              new Date(
                //getDateAtLocalTime(current_subrange.images[current_subrange.images.length - 1].created_at)
                timeFromString(
                  current_subrange.images[current_subrange.images.length - 1]
                    .created_at
                )
              ).getHours()
            )
          : current_hour;

      current_subrange.end_hour = max_hour;
      list_of_subranges.push(current_subrange);
      ///return list_of_subranges;
    }
    console.log('list of subranges input', images);
    console.log('list of subranges', list_of_subranges);
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
          <div key={date.toDateString() + subrange.start_hour} className="mb-8">
            <div className="text-lg font-semibold mb-2">
              {subrange.start_hour > 12
                ? `${subrange.start_hour - 12}PM`
                : `${subrange.start_hour}AM`}{' '}
              -{' '}
              {subrange.end_hour - 12
                ? `${subrange.end_hour - 12}PM`
                : `${subrange.end_hour}AM`}
            </div>
            <div className="flex flex-wrap flex-row justify-around mt-4 items-center gap-y-4">
              {subrange.images.map((image, i) => {
                return (
                  <div
                    key={image.id}
                    className="relative flex flex-col items-center w-1/6"
                  >
                    <div
                      key={image.id}
                      className="relative w-full flex m-4 flex-col items-center p-4 bg-white rounded-lg shadow-lg border border-gray-300"
                    >
                      <div
                        onClick={() => setSelectedImageLocation(image)}
                        className="w-32 h-[128px] flex items-center justify-center bg-gray-100 p-5 border border-gray-700"
                      >
                        <NextImage
                          src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                          alt={`Image for ${image.created_at}`}
                          width={128}
                          height={128}
                          className="object-contain rounded-lg shadow-md"
                          style={{
                            cursor: 'pointer',
                            margin: '10px',
                            border:
                              selected_image_location &&
                              selected_image_location.id === image.id
                                ? '5px solid blue'
                                : 'none',
                          }}
                        />
                      </div>
                      <div className="absolute top-1 right-1 flex ">
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

export default Image_View_ByDate;
