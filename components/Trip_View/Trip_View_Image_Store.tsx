'use client';
import { useStore } from '@tanstack/react-store';
import { Listener, Store } from '@tanstack/store';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { MdImagesearchRoller } from 'react-icons/md';
import { updateDaySummary } from '../../../server/src/routes/summaries';

import { dateFromString, timeFromString } from './Time_Functions';

import { Image, Path, Trip } from '@/definitions/Trip_View';

import axios from 'axios';

const getBearerFromLocalStorage = () => {
  return localStorage.getItem('accessToken');
};

const createRequestHeaders: () => HeadersInit = () => {
  return {
    Authorization: `Bearer ${getBearerFromLocalStorage()}`,
  };
};

const fetchTripImages = async (trip_id: string): Promise<Image[]> => {
  const auth_token = getBearerFromLocalStorage();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/images`,
    {
      headers: createRequestHeaders(),
    }
  );
  const images = await response.json();

  //return images
  return images;
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
        Authorization: `Bearer ${getBearerFromLocalStorage()}`,
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
          Authorization: `Bearer ${getBearerFromLocalStorage()}`,
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
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/paths`,
    {
      headers: createRequestHeaders(),
    }
  );
  return response.json();
};

const fetchTrip = async (trip_id: string) => {
  const auth_token = getBearerFromLocalStorage();
  if (!trip_id) {
    return [];
    //throw new Error('trip_id is not defined');
    // throw new Error('trip_id is not defined');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}`,
    {
      headers: createRequestHeaders(),
    }
  );
  const data = await response.json();
  return data[0];
};

const fetchDaySummary = async (trip_id: string, date: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/day_summaries/${date}`,
    {
      headers: createRequestHeaders(),
    }
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
        ...createRequestHeaders(),
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
    queryFn: async () => {
      if (!trip_id) {
        throw new Error('trip_id is not defined');
      }

      const images: Image[] = await fetchTripImages(trip_id);
      //serialized images - turn created_at into a Date if it is a string
      //also, subtract new Date().getTimezoneOffset() from each image

      const subtraction_minutes = new Date().getTimezoneOffset();

      const transformed_images = images.map((image) => {
        image.created_at = new Date(image.created_at);
        image.created_at.setMinutes(
          image.created_at.getMinutes() + subtraction_minutes
        );

        return image;
      });

      return transformed_images;
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

  horizontally_tabbed: boolean;

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

//fetch initial state from local storage
const init_state: PersistedSettings = JSON.parse(
  localStorage.getItem('trip_view_settings') || '{}'
);

export const tripViewStore = new Store<StoreState>({
  //selected_trip_id: '',
  filtering_images: init_state.filtering_images || false,
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
  day_by_day_banners: init_state.day_by_day_banners ?? true,
  zoom_on_day_change: init_state.zoom_on_day_change ?? true,
  image_heat_map: init_state.image_heat_map ?? true,
  paths_open: init_state.paths_open ?? true,
  comparing_photos: false,
  horizontally_tabbed: init_state.horizontally_tabbed ?? true,

  adding_images: false,

  adding_path: false,
  done_comparing: false,

  map_open: init_state.map_open ?? true,
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

    //easier way to do to this now

    //get start_date
    const dateStart = dateFromString(start_date);
    dateStart.setDate(dateStart.getDate() + selected_date);

    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    //now filter through images and return images that are on that day
    //using timeFromString

    const imagesOnDay = images.filter((image) => {
      const imageDate = new Date(image.created_at);

      //const imageDate = timeFromString(image.created_at);
      return imageDate >= dateStart && imageDate < dateEnd;
    });

    return imagesOnDay.sort((a, b) => {
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

const StoringSate: Listener = () => {
  //create a persisted settings object
  const persistedSettings: PersistedSettings = {
    filtering_images: tripViewStore.state.filtering_images,
    image_heat_map: tripViewStore.state.image_heat_map,
    paths_open: tripViewStore.state.paths_open,
    zoom_on_day_change: tripViewStore.state.zoom_on_day_change,
    day_by_day_banners: tripViewStore.state.day_by_day_banners,
    map_open: tripViewStore.state.map_open,
    horizontally_tabbed: tripViewStore.state.horizontally_tabbed,
  };

  //serialize the object
  const serializedSettings = JSON.stringify(persistedSettings);

  //store the settings
  localStorage.setItem('trip_view_settings', serializedSettings);
};

//add listener to the store
tripViewStore.subscribe(StoringSate);
//persist the store

type PersistedSettings = {
  //doesn't include thigns like images, paths, etc state controlling forms, etc.
  filtering_images: boolean;
  image_heat_map: boolean;
  paths_open: boolean;
  zoom_on_day_change: boolean;
  day_by_day_banners: boolean;
  map_open: boolean;
  horizontally_tabbed: boolean;
};
