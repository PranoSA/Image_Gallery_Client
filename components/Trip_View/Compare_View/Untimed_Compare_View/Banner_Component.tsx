'use client';

import {
  useTripViewStore,
  tripViewStore,
  useQueryTrip,
  useQueryDaySummary,
  updateDaySummaryMutation,
  useUpdateDaySummary,
  useQueryTripImages,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { HiChevronLeft, HiOutlinePencil } from 'react-icons/hi';
import { HiChevronRight } from 'react-icons/hi';

import { useContext, useEffect, useMemo, useState } from 'react';
import TripContext from '@/components/TripContext';
import {
  CompareViewStore,
  useCompareViewStore,
} from '@/components/Trip_View/Compare_View/CompareStore';
import { copyFile } from 'fs';

type BanngerComponentProps = {
  go_to_next_available_image?: boolean; //default is false
};

export const Banner_Component: React.FC<BanngerComponentProps> = ({
  go_to_next_available_image = false,
}) => {
  //get the information about the trip and the current_date
  const { editingDaySummary } = useTripViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  const selected_trip_id = useContext(TripContext).id;

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(selected_trip_id);

  const viewStore = useTripViewStore();
  //get the trip information, loading state, and error state from useQueryTrip
  const { data: trip, isLoading, error } = useQueryTrip(selected_trip_id);

  const selectedDateToDayOfYear = () => {
    //return string version of the current date
    return untimed_trips_selected_date.toISOString().split('T')[0];
  };

  const { data: daySummary, isLoading: daySummaryLoading } = useQueryDaySummary(
    selected_trip_id,
    selectedDateToDayOfYear()
  );

  const [daySummaryFormInput, setDaySummaryFormInput] = useState('');

  const currentDay = useMemo(() => {
    //get the untimed_trips_selected_date
    const selected_date = untimed_trips_selected_date;

    console.log('Selected Date', selected_date.toString());
    console.log(selected_date.toISOString().split('T')[0]);
    return selected_date.toISOString().split('T')[0];
  }, [untimed_trips_selected_date]);

  useEffect(() => {
    if (daySummary && !daySummaryLoading) {
      setDaySummaryFormInput(daySummary.summary);
    }
  }, [daySummary, daySummaryLoading]);

  //set the day summary when the trip is loaded
  if (daySummary && !daySummaryLoading) {
    //setDaySummaryFormInput(daySummary);
  }

  if (!selected_trip_id) {
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const setEditingDaySummary = (value: boolean) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        editingDaySummary: value,
      };
    });
  };

  /*
  // get the selected_day and subtract from the start_date of the trip
  const daysElapsed = calculateDaysElapsed(
    trip?.start_date || selected_date,
    selected_date
  );*/

  const handleDayChange = (direction: 'prev' | 'next') => {
    //absolutely unnecessary to use get_images_for_day
    console.log(untimed_trips_selected_date);
    const day_value =
      untimed_trips_selected_date.getDate() +
      365 * untimed_trips_selected_date.getFullYear();
    console.log('Day Value Today', day_value);
    if (!images) return;

    //reverse the images array [latest image first] for this purpose
    const images_reversed = images.slice().reverse();

    if (direction === 'prev') {
      for (var image of images_reversed) {
        //find image with the date (as in the day) that is after the current date
        const image_day =
          image.created_at.getDate() + 365 * image.created_at.getFullYear();

        if (image_day < day_value) {
          console.log('Found Prev Image');
          console.log(image);
          console.log('Day Value Image', day_value);
          CompareViewStore.setState((state) => {
            return {
              ...state,
              untimed_trips_selected_date: image.created_at,
            };
          });
          return;
        }
      }
    } else {
      for (var image of images) {
        //find image with the date (as in the day) that is after the current date
        const image_day =
          image.created_at.getDate() + 365 * image.created_at.getFullYear();

        if (image_day > day_value) {
          console.log('Found Next Image');
          console.log(image);
          console.log('Day Value Image', day_value);
          CompareViewStore.setState((state) => {
            return {
              ...state,
              untimed_trips_selected_date: image.created_at,
            };
          });
          return;
        }
      }
    }
  };

  function submitDayDescription(event: React.MouseEvent<HTMLButtonElement>) {
    return; // for now, just ignore this stuff
    event.preventDefault();

    //use the mutation hook
    //useUpdateDaySummary({});

    //use the updateDaySummaryMutation to update the day summary
    updateDaySummaryMutation(
      selected_trip_id,
      // selected_date,
      selectedDateToDayOfYear(),
      daySummaryFormInput
    );

    //set the editingDaySummary to false
    setEditingDaySummary(false);

    //update the daySummaryFormInput
    setDaySummaryFormInput(daySummaryFormInput);
  }

  return (
    <div className="flex justify-around items-center mb-4 p=5">
      <FaChevronLeft
        onClick={() => {
          handleDayChange('prev');
        }}
        className={`cursor-pointer `}
      />

      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full flex flex-col items-center">
          <div className="text-2xl font-bold mb-4">{currentDay.toString()}</div>
        </div>
        {/* Display the Day Summary, and then allow editing of it */}
        <div className="flex flex-col items-center mt-4">
          <div className="w-full flex justify-center items-center">
            <HiOutlinePencil
              onClick={() => setEditingDaySummary(true)}
              className="cursor-pointer"
            />
          </div>
          {editingDaySummary ? (
            <div className="w-full flex flex-col items-center">
              <textarea
                value={daySummaryFormInput || ''}
                onChange={(e) => setDaySummaryFormInput(e.target.value)}
                className="w-full h-40 p-4 max-w-2xl"
              ></textarea>
              <button onClick={(e) => submitDayDescription(e)} className="mt-2">
                Save
              </button>
              <button
                onClick={() => setEditingDaySummary(false)}
                disabled={!editingDaySummary}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="w-full text-center">{daySummary?.summary}</div>
          )}
        </div>
      </div>
      <FaChevronRight
        onClick={() => {
          handleDayChange('next');
        }}
        className={`cursor-pointer`}
      />
    </div>
  );
};
