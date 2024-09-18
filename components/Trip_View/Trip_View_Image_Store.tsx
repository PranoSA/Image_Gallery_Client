import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MdImagesearchRoller } from 'react-icons/md';
import { updateDaySummary } from '../../../server/src/routes/summaries';

const fetchTripImages = async (trip_id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/images`
  );
  return response.json();
};

//mutation to update image metadata
const updateImageMutation = async (image: Image, trip: Trip) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip.id}/images/${image.id}`,
    {
      method: 'POST',
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
    mutationFn: ({ image, trip }: any) => updateImageMutation(image, trip),
  });
};

const fetchTripPaths = async (trip_id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/paths`
  );
  return response.json();
};

const fetchTrip = async (trip_id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}`
  );
  const data = await response.json();
  return data[0];
};

const fetchDaySummary = async (trip_id: string, date: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/day_summary/${date}`
  );
  return response.json();
};

export const updateDaySummaryMutation = async (
  trip_id: string,
  date: string,
  summary: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/day_summary/${date}`,
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
  });
};

export const useQueryTrip = (trip_id: string) => {
  return useQuery({
    queryKey: ['trip', trip_id],
    queryFn: () => fetchTrip(trip_id),
  });
};

export const useQueryTripImages = (trip_id: string) => {
  return useQuery<Image[]>({
    queryKey: ['trip', trip_id, 'images'],
    queryFn: () => fetchTripImages(trip_id),
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
  selected_trip_id: string;

  selected_images: Image[]; // This is for modification and deletion

  selected_image_location: Image | null; // this is for viewing the image on the map

  selected_image_preview: Image | null; // this is for viewing on the screen

  editingImage: Image | null; // this is for editing the image

  // now lets differentiate between Time View and Singular Date View
  date_or_time_view: 'date' | 'time';

  // for the date view
  selected_date: number;

  //for the time view -> Store scroll position
  scroll_position: number;
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
  selected_trip_id: '',
  editingDaySummary: false,
  selected_date: 0, //'1970-01-01',
  selected_images: [],
  selected_image_preview: null,
  selected_image_location: null,
  date_or_time_view: 'date',
  scroll_position: 0,
  editingImage: null,
  viewed_image_index: null,
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
