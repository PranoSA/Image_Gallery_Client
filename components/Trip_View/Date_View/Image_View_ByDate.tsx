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
import { useState, useContext, useMemo } from 'react';

import EditImageForm from '@/components/Trip_View/EditImageForm';
import ImagePreview from '@/components/Trip_View/ImagePreview';

import '@/components/Trip_View/Date_View/Image_View_ByDate.css';

import TripContext from '@/components/TripContext';
import { Banner_Component } from '@/components/Trip_View/Banner_Component';

import {} from '@/components/Trip_View/Time_View/Time_View_Gallery';

import { AiFillDelete } from 'react-icons/ai';

type ImageViewByDateProps = {
  scrollToImage?: (image: Image) => void;
};

const Image_View_ByDate: React.FC<ImageViewByDateProps> = ({
  scrollToImage = (image: Image) => {},
}) => {
  const {
    selected_date,

    selected_image_location,
    editingImage,
    filtered_categories,
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

  const bannerComponent = useMemo(() => {
    return <Banner_Component />;
  }, []);

  type ImagesByDay = {
    date: Date;
    images: (Image & { index: number })[];
  };

  const groupedOrderedImagesByDay: ImagesByDay = useMemo(() => {
    const groupImagesByDay = (images: Image[] | undefined) => {
      const grouped: ImagesByDay = {
        date: new Date(),
        images: [],
      };

      if (!trip) return grouped;
      if (!images || images.length === 0) return grouped;

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
        .filter((image) => {
          return !filtered_categories.includes(image.category || '');
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

    return groupImagesByDay(images);
  }, [images, trip, selected_date, filtered_categories]);

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
      <div className="gallery mt-4 w-full justify-center bg-white rounded-b-lg shadow-lg border border-gray-300"></div>
      <div className="w-full h-full scrollable-container overflow-y-auto  p-4 bg-white rounded-b-lg shadow-lg border border-gray-300">
        {bannerComponent}
        <GroupImagesByTime
          images={groupedOrderedImagesByDay.images}
          date={groupedOrderedImagesByDay.date}
          scrollToImage={scrollToImage}
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
  images: (Image & { index: number })[];
};

type groupImagesByTimeProps = {
  images: (Image & { index: number })[];
  date: Date;
  scrollToImage: (image: Image) => void;
};

const GroupImagesByTime: React.FC<groupImagesByTimeProps> = ({
  images,
  date,
  scrollToImage = (image: Image) => {},
}) => {
  // group images into SubRangeOfImages
  const { selected_image_location, horizontally_tabbed } = useTripViewStore();

  const deleteImageMutation = useDeleteImage();

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

  const setShowOnMap = (image: Image) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        scroll_to_image: image,
      };
    });
  };

  //child size should be 1/3 of the parent

  //return gallery based on subranges
  return (
    <div className="p-4 mb-5" id="2312">
      {subranges.map((subrange) => {
        const parent_width = document.getElementById('2312')?.clientWidth || 0;

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
            <div className="flex flex-wrap flex-row items-stretch justify-around items-center gap-y-1 parent-container">
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
                      className="relative w-full h-full flex flex-col  p-4 bg-white rounded-lg shadow-lg border border-gray-300"
                    >
                      <div
                        onClick={() => setSelectedImageLocation(image)}
                        className="relative flex flex-grow items-center justify-center bg-gray-100 p-1 border h-[200px] min-w-[200px] "
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
                          onClick={() => setPreviewImage(image.index)}
                          className="cursor-pointer"
                          size={24}
                        />
                        <HiMap
                          onClick={() => {
                            setSelectedImageLocation(image);
                            setShowOnMap(image);
                          }}
                          className="cursor-pointer ml-2"
                          size={24}
                        />
                      </div>
                      <div className="mt-2 text-center text-sm font-medium text-gray-700 justify-self-end">
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
