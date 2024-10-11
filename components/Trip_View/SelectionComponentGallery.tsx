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

  const handleToggle = () => {
    if (date_or_time_view === 'time') {
      setView('date');
    } else {
      setView('time');
    }
  };

  return (
    <div className="text-center ">
      {/* Should be Singular Row with justify space around*/}
      <div className="w-full flex flex-wrap flex-row items-center justify-around ">
        <div className="w-1/4 flex justify-center">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              id="toggle"
              className="sr-only"
              checked={date_or_time_view === 'date'}
              onChange={handleToggle}
            />
            <label
              htmlFor="toggle"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                    date_or_time_view === 'date'
                      ? 'transform translate-x-full bg-green-500'
                      : 'bg-blue-500'
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">
                {date_or_time_view === 'time' ? (
                  <div className="flex items-center gap-2">
                    <FaClock size={30} />
                    Time View
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaCalendar size={20} />
                    Date View
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
        <div className="w-1/4 flex flex-col items-center justify-center">
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
              className=" hover:text-blue-700 transition-colors duration-200"
            >
              <div className="flex flex-row items-center justify-center gap-1">
                <span className="text-lg">Add Images</span>
                <FaPlus />
              </div>
            </button>
          </div>
        </div>
        <div className="w-1/4 flex justify-center">
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
                className=" hover:text-blue-700 transition-colors duration-200"
              >
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="text-lg">Filter Categories</span>
                </div>
              </button>
            )}
          </div>
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
