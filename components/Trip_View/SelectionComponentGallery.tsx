'use client';

/*      {view === 'date' ? (
        <button onClick={() => setView('time')}>Switch to Time View</button>
      ) : (
        <button onClick={() => setView('date')}>Switch to Date View</button>
      )}

      {view === 'time' ? TimeViewGallery({}) : Image_View_ByDate({})}
*/

import { useState, useEffect } from 'react';

import Image_View_ByDate from '@/components/Trip_View/Date_View/Image_View_ByDate';
import TimeViewGallery from '@/components/Trip_View/Time_View/Time_View_Gallery';

import { FaClock, FaCalendar, FaPlus } from 'react-icons/fa';

import { useQuery } from '@tanstack/react-query';
import { tripViewStore, useQueryTrip } from './Trip_View_Image_Store';

import TripContext from '@/components/TripContext';
import { useContext } from 'react';

import { useTripViewStore } from './Trip_View_Image_Store';

import AddImagesForm from './AddImagesForm';

import FilteredCategoryForm from '@/components/Trip_View/FilteredCategoryForm';

type SelectionComponentGalleryProps = {
  view: 'time' | 'date';
};

const SelectionComponentGallery = () => {
  const { date_or_time_view } = useTripViewStore();
  const store = tripViewStore;

  const setView = (view: 'date' | 'time') => {
    store.setState((state) => {
      return { ...state, date_or_time_view: view };
    });
  };

  //pre-render TimeViewGallery

  return (
    <div className="text-center my-5">
      {/* Modal to Add New Images */}
      <AddImagesForm />
      {/* Plus Icon To Add New Image */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            store.setState((state) => {
              return { ...state, adding_images: true };
            });
          }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          <FaPlus />
        </button>
      </div>
      {/* Div For Filtering Categories if filtering_selection, or a button to open it */}
      <div className="w-full items-center justify-center">
        {store.state.selecting_category ? (
          <FilteredCategoryForm />
        ) : (
          <button
            onClick={() => {
              store.setState((state) => {
                return { ...state, selecting_category: true };
              });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Filter Categories
          </button>
        )}
      </div>
      {/* Div For Filtering Categories if filtering_selection, or a button to open it */}

      <div className="mb-5 flex justify-around gap-4">
        <button
          onClick={() => setView('time')}
          className={`px-4 py-2 text-lg cursor-pointer rounded flex items-center justify-center gap-2 ${
            date_or_time_view === 'time'
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white'
          }`}
          disabled={date_or_time_view === 'time'}
        >
          <FaClock />
          Time View
        </button>
        <button
          onClick={() => setView('date')}
          className={`px-4 py-2 text-lg cursor-pointer rounded flex items-center justify-center gap-2 ${
            date_or_time_view === 'date'
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-green-500 text-white'
          }`}
          disabled={date_or_time_view === 'date'}
        >
          <FaCalendar />
          Date View
        </button>
      </div>
      {date_or_time_view === 'time' ? (
        <TimeViewGallery />
      ) : (
        <Image_View_ByDate />
      )}
    </div>
  );
};

const SampleUseEffectErrorComponent1 = () => {
  const [data, setData] = useState<{ view: string; content: string } | null>(
    null
  );

  useEffect(() => {
    console.log('Fetching time view data...');
    // Simulate data fetching
    setTimeout(() => {
      setData({ view: 'time', content: 'Time view contenzzzzzt' });
    }, 1000);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Time View</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const SampleUseEffectErrorComponent12 = () => {
  const [data, setData] = useState<{ view: string; content: string } | null>(
    null
  );

  useEffect(() => {
    console.log('Fetching time view data...');
    // Simulate data fetching
    setTimeout(() => {
      setData({ view: 'time2', content: 'Time view content2zzzz' });
    }, 1000);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Time Other Content View</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const fetchTimeViewData = async () => {
  console.log('Fetching time view data...');
  // Simulate data fetching
  //wait for 1 second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    view: 'time',
    content: 'Time view content',
  };
};

const SampleUseQueryComponent1: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['timeViewData'],
    queryFn: fetchTimeViewData,
  });
  const id = useContext(TripContext).id;
  const {
    data: trip,
    isLoading: tripIsLoading,
    error: tripError,
  } = useQueryTrip(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Time View</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <h1> Trip Data</h1>
      <pre>{JSON.stringify(trip, null, 2)}</pre>
    </div>
  );
};

const fetchDateViewData = async () => {
  return new Promise<{ view: string; content: string }>((resolve) => {
    setTimeout(() => {
      resolve({ view: 'date', content: 'Date view content' });
    }, 1000);
  });
};

const TimeViewGallery2: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dateViewData'],
    queryFn: fetchDateViewData,
  });

  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripIsLoading,
    error: tripError,
  } = useQueryTrip(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Date View</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <h1> Trip Data</h1>
      <pre>{JSON.stringify(trip, null, 2)}</pre>
    </div>
  );
};

const SampleUseQueryComponent2: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dateViewData'],
    queryFn: fetchDateViewData,
  });

  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripIsLoading,
    error: tripError,
  } = useQueryTrip(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Date View</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <h1> Trip Data</h1>
      <pre>{JSON.stringify(trip, null, 2)}</pre>
    </div>
  );
};

export default SelectionComponentGallery;
