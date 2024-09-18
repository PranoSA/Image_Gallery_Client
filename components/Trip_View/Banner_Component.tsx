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

import { useState } from 'react';

export const Banner_Component: React.FC = () => {
  //get the information about the trip and the current_date
  const { selected_trip_id, selected_date, editingDaySummary } =
    useTripViewStore();
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

  //set the day summary when the trip is loaded
  if (daySummary && !daySummaryLoading) {
    setDaySummaryFormInput(daySummary);
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

  const calculateDaysElapsed = (start_date: string, end_date: string) => {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const elapsed = end.getTime() - start.getTime();
    return elapsed / (1000 * 3600 * 24);
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
  return (
    <div className="flex justify-around items-center mb-4">
      <FaChevronLeft
        onClick={() => handleDayChange('prev')}
        className="cursor-pointer"
      />

      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full flex flex-col items-center">
          <span className="w-full text-center">
            Day # {selected_date + 1} /{' '}
            {calculateDaysElapsed(
              trip?.start_date || selected_date,
              trip?.end_date || selected_date
            )}{' '}
            :
          </span>
          <span className="w-full text-center">
            {selectedDateToDayOfYear()}
          </span>
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
              <button onClick={submitDayDescription} className="mt-2">
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
            <div className="w-full text-center">{daySummary}</div>
          )}
        </div>
      </div>
      <FaChevronRight
        onClick={() => handleDayChange('next')}
        className="cursor-pointer"
      />
    </div>
  );
};
