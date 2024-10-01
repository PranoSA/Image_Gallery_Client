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
    <div className="text-center my-5 ">
      {/* Should be Singular Row with justify space around*/}
      <div className="w-full flex flex-wrap flex-row items-center justify-around pb-3">
        <div className="w-1/4 flex justify-center">
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
        </div>
        <div className="w-1/4 flex flex-col items-center justify-center space-y-2">
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
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              <div className="flex flex-row items-center justify-center gap-1">
                <span className="text-lg"> Add Images </span>
                <FaPlus />
              </div>
            </button>
          </div>
        </div>
        <div className="w-1/4 flex justify-center">
          {' '}
          {/* Div For Filtering Categories if filtering_selection, or a button to open it */}
          <div className="w-full flex justify-center">
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
        </div>

        <div className="w-1/4 flex justify-center">
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
      </div>
      <div className=" w-full flex flex-wrap justify-center  bg-white rounded-b-lg shadow-lg border border-gray-300">
        {date_or_time_view === 'time' ? (
          <TimeViewGallery />
        ) : (
          <Image_View_ByDate />
        )}
      </div>
    </div>
  );
};

//w-full flex flex-wrap justify-center  bg-white rounded-b-lg shadow-lg border border-gray-300"

export default SelectionComponentGallery;
