'use client';
import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { MdImagesearchRoller } from 'react-icons/md';
import { updateDaySummary } from '../../../server/src/routes/summaries';

import { dateFromString, timeFromString } from './Time_Functions';

import { Image, Path, Trip } from '@/definitions/Trip_View';

import axios from 'axios';

const fetchTripImages = async (trip_id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/images`
  );
  return response.json();
};

function timestampReviver(key: any, value: any) {
  // Check if the value is a timestamp (e.g., a string that can be parsed as a date)
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    // Convert the timestamp to a string
    return value;
  }
  return value;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

//mutation to update image metadata
const updateImageMutation = async (image: Image, trip: Trip) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip.id}/images/${image.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(image),
    }
  );
  return response.json();
};

// useQuery hook for updating image metadata with mutation
export const UpdateImage = () => {
  return useMutation({
    mutationFn: ({ image, trip }: { image: Image; trip: Trip }) =>
      updateImageMutation(image, trip),
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ['images'] }); // invalidate the query cache
      //invalidate - then set the images to the new data
      //queryKey: ['trip', trip_id, 'images'],
      //queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    onMutate: async (newData) => {
      //the query key is queryKey: ['trip', trip_id, 'images'],
      // queryKey: ['trip', trip_id, 'images'],
      await queryClient.cancelQueries({
        queryKey: ['trip', newData.trip.id.toString(), 'images'],
      });

      //get all images from the 'images' query
      //const previousData = queryClient.getQueryData<Image[]>(['images']);

      //the query key is queryKey: ['trip', trip_id, 'images'],
      const previousData = queryClient.getQueryData<Image[]>([
        'trip',
        newData.trip.id.toString(),
        'images',
      ]);

      if (!previousData) {
        console.error('No previous data');

        console.log("Image's trip id: ", newData.trip.id);
        return;
      }

      //find the image to update
      const imageToUpdate = previousData.find(
        (image) => image.id === newData.image.id
      );

      //set the image to the new data

      const new_data = previousData.map((image) => {
        if (image.id === newData.image.id) {
          return newData.image;
        }
        return image;
      });

      queryClient.setQueryData(
        ['trip', newData.trip.id.toString(), 'images'],
        new_data
      );

      console.log('New Image Data: ', newData.image);

      //old image
      console.log('Old Image Data: ', imageToUpdate);

      //what is the return variable for exactly?
      return { imageToUpdate, previousData };
    },
    onError: (error, variables, context) => {
      //if there is an error, revert the changes

      if (context?.previousData) {
        queryClient.setQueryData(['images'], context.previousData);
      }
    },
  });
};

//delete and  add image mutation
const addImages = async (formData: FormData, id: string) => {
  //this was done through multipart-form
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    console.error('Error uploading images:', error);
  }
};

export const useAddImage = () => {
  return useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id: string }) =>
      addImages(formData, id),
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ['images'] });

      //just refetch the images
      queryClient.invalidateQueries({ queryKey: ['images'] });

      //close the modal
      tripViewStore.setState((state) => {
        return {
          ...state,
          adding_images: false,
        };
      });

      //refetch the images
    },
    onMutate: () => {
      // add the image to the list of images
      const previousData = queryClient.getQueryData<Image[]>(['images']);
    },
  });
};

const fetchTripPaths = async (trip_id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/paths`
  );
  return response.json();
};

const fetchTrip = async (trip_id: string) => {
  if (!trip_id) {
    console.log('failed to fetch trip');
    return [];
    //throw new Error('trip_id is not defined');
    // throw new Error('trip_id is not defined');
  }
  console.log('Used query trip');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}`
  );
  const data = await response.json();
  return data[0];
};

const fetchDaySummary = async (trip_id: string, date: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/day_summa23123ries/${date}`
  );
  return response.json();
};

export const updateDaySummaryMutation = async (
  trip_id: string,
  date: string,
  summary: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/day_summa123123123ries/${date}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    }
  );
  return response.json();
};

//update the day summary
export const useUpdateDaySummary = () => {
  return useQuery({
    queryKey: ['update_day_summary'],
    queryFn: ({ trip_id, date, summary }: any) =>
      updateDaySummaryMutation(trip_id, date, summary),
  });
};

export const useQueryDaySummary = (trip_id: string, date: string) => {
  return useQuery({
    queryKey: ['trip', trip_id, 'day_summary', date],
    queryFn: () => fetchDaySummary(trip_id, date),
    retry: false,
  });
};

export const useQueryTrip = (trip_id: string) => {
  return useQuery<Trip>({
    queryKey: ['trip', trip_id || '0'],
    queryFn: () => fetchTrip(trip_id || '0'),
  });
};

export const useQueryTripImages = (trip_id: string) => {
  return useQuery<Image[]>({
    queryKey: ['trip', trip_id, 'images'],
    queryFn: () => {
      if (!trip_id) {
        throw new Error('trip_id is not defined');
      }

      const images = fetchTripImages(trip_id);
      //console.log('Images 1-5', images.slice(0, 5));

      return images;
    },
  });
};

export const useQueryTripPaths = (trip_id: string) => {
  return useQuery<Path[]>({
    queryKey: ['trip', trip_id, 'paths'],
    queryFn: () => fetchTripPaths(trip_id),
  });
};

type StoreState = {
  //trip_images: Image[]; //derived from server state - although it is important that client side properties
  //are derived from server state
  // trip_paths: Path[];
  //start_date: string;
  //end_date: string;
  //selected_trip_id: string;
  filtered_categories: string[];

  selecting_category: boolean; //this is for opening / closing the form

  filtering_images: boolean; //this is for filtering images

  selected_images: Image[]; // This is for modification and deletion

  selected_image_location: Image | null; // this is for viewing the image on the map

  selected_image_preview: Image | null; // this is for viewing on the screen

  editingImage: Image | null; // this is for editing the image

  // now lets differentiate between Time View and Singular Date View
  date_or_time_view: 'date' | 'time';

  paths_open: boolean;

  zoom_on_day_change: boolean;

  image_heat_map: boolean;

  day_by_day_banners: boolean;

  comparing_photos: boolean;

  //after done comparing image - we need to go to the deletion screen
  done_comparing: boolean;

  // for the date view
  selected_date: number;

  //whether map is open or not
  map_open: boolean;

  //for the time view -> Store scroll position
  scroll_position: number;

  //to show the form modal
  adding_images: boolean;

  //adding paths
  adding_path: boolean;

  // for the time view -> return a time order of the images
  get_images_for_time: (images: Image[]) => Image[];

  //for the date view -> return images in time order for the selected date
  get_images_for_day: (
    selected_date: number,
    start_date: string,
    images: Image[]
  ) => Image[];

  viewed_image_index: number | null; // This is for the wide view of the image

  //foprm information
  editingDaySummary: boolean;

  // return images that are before start_date, after end_date, or has no date
  get_unsorted_images: (
    images: Image[],
    trip_end_date: string,
    trip_start_date: string
  ) => Image[];
};

export const tripViewStore = new Store<StoreState>({
  //selected_trip_id: '',
  filtering_images: false,
  selecting_category: false,
  filtered_categories: [],
  editingDaySummary: false,
  selected_date: 0, //'1970-01-01',
  selected_images: [],
  selected_image_preview: null,
  selected_image_location: null,
  date_or_time_view: 'date',
  scroll_position: 0,
  editingImage: null,
  viewed_image_index: null,
  day_by_day_banners: true,
  zoom_on_day_change: true,
  image_heat_map: true,
  paths_open: true,
  comparing_photos: false,

  adding_images: false,

  adding_path: false,
  done_comparing: false,

  map_open: true,
  get_images_for_time: (images: Image[]) => {
    //return images order by time
    return images.sort((a, b) => {
      // convert to epoch, then compare
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  },
  get_images_for_day: (
    selected_date: number,
    start_date: string,
    images: Image[]
  ) => {
    //return images at that day, ordered by time
    console.log('Filtering Through Images', images);
    //get start_date
    const dateStart = dateFromString(start_date);
    dateStart.setDate(dateStart.getDate() + selected_date);

    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    //now filter through images and return images that are on that day
    //using timeFromString

    const imagesOnDay = images.filter((image) => {
      const imageDate = timeFromString(image.created_at);
      return imageDate >= dateStart && imageDate < dateEnd;
    });

    return imagesOnDay.sort((a, b) => {
      // convert to epoch, then compare
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    //t
    const dateSearch = new Date(start_date);
    dateSearch.setDate(dateSearch.getDate() + selected_date);
    return images
      .filter((image) => {
        return (
          image.created_at.split('T')[0] ===
          dateSearch.toISOString().split('T')[0]
        );
      })
      .sort((a, b) => {
        // convert to epoch, then compare
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
  },
  get_unsorted_images: (
    images: Image[],
    trip_end_date: string,
    trip_start_date: string
  ) => {
    const trip_start_date_epoch = new Date(trip_start_date).getTime();
    const trip_end_date_epoch = new Date(trip_end_date).getTime();

    return images.filter((image) => {
      return (
        new Date(image.created_at).getTime() < trip_start_date_epoch ||
        new Date(image.created_at).getTime() > trip_end_date_epoch ||
        !image.created_at
      );
    });
  },
});

export const useTripViewStore = () => {
  return useStore(tripViewStore);
};
