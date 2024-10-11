'use client';

import {
  useTripViewStore,
  tripViewStore,
  useQueryTrip,
  useQueryDaySummary,
  updateDaySummaryMutation,
  useUpdateDaySummary,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import { HiChevronLeft, HiOutlinePencil } from 'react-icons/hi';
import { HiChevronRight } from 'react-icons/hi';

import { useContext, useEffect, useMemo, useState } from 'react';
import TripContext from '@/components/TripContext';

export const Banner_Component: React.FC = () => {
  //get the information about the trip and the current_date
  const { selected_date, editingDaySummary, date_or_time_view } =
    useTripViewStore();

  const selected_trip_id = useContext(TripContext).id;

  const viewStore = useTripViewStore();
  //get the trip information, loading state, and error state from useQueryTrip
  const { data: trip, isLoading, error } = useQueryTrip(selected_trip_id);

  const selectedDateToDayOfYear = () => {
    if (!trip) {
      //return epoch time
      return new Date().toISOString().split('T')[0];
    }
    const startDate = new Date(trip?.start_date);
    startDate.setDate(startDate.getDate() + selected_date);
    //return string version of the current date
    return new Date(startDate).toISOString().split('T')[0];
  };

  const { data: daySummary, isLoading: daySummaryLoading } = useQueryDaySummary(
    selected_trip_id,
    selectedDateToDayOfYear()
  );

  const [daySummaryFormInput, setDaySummaryFormInput] = useState('');

  const currentDay = useMemo(() => {
    // get the selected_day and subtract from the start_date of the trip
    //ignore time zone - everytjhin is in UTC
    // and has no time zone information

    const start_date = trip?.start_date || '1970-01-01';

    const trip_start_date = new Date(start_date);
    trip_start_date.setDate(trip_start_date.getDate() + selected_date);

    //add offset from UTC in current time-zoen - to accurately translate what it isin== UTC to the current time zone
    const offset_minutes = trip_start_date.getTimezoneOffset();

    //add the offset to the start_date
    trip_start_date.setMinutes(trip_start_date.getMinutes() + offset_minutes);

    return trip_start_date.toDateString();

    const [year, month, day] = start_date.split('-').map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    date.setDate(date.getDate() + selected_date);

    //convert back to UTC date

    //return UTC string Day of Week, Month Day, Year
    return date.toUTCString().split(' ').slice(0, 4).join(' ');
  }, [selected_date, trip]);

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
    const newDate = new Date(selected_date);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    tripViewStore.setState((state) => {
      return {
        ...state,
        selected_date:
          direction === 'prev'
            ? state.selected_date - 1
            : state.selected_date + 1,
      };
    });
  };

  function submitDayDescription(event: React.MouseEvent<HTMLButtonElement>) {
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

  const total_days = () => {
    if (!trip) {
      return 0;
    }

    const start_date = new Date(trip?.start_date);
    const end_date = new Date(trip?.end_date);

    const elapsed = end_date.getTime() - start_date.getTime();

    return Math.ceil(elapsed / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="flex justify-around items-center mb-4 p=5">
      <FaChevronLeft
        onClick={() => {
          if (selected_date !== 0) {
            handleDayChange('prev');
          }
        }}
        className={`cursor-pointer ${
          selected_date === 0 ? 'cursor-not-allowed opacity-50' : ''
        }`}
      />

      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full flex flex-col items-center">
          <span className="w-full text-center">
            Day # {selected_date + 1} / {total_days()}
          </span>
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
          if (selected_date < total_days() - 1) {
            handleDayChange('next');
          }
        }}
        className={`cursor-pointer ${
          selected_date >= total_days() - 1
            ? 'cursor-not-allowed opacity-50'
            : ''
        }`}
      />
    </div>
  );
};
