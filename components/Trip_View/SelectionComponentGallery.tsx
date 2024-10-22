'use client';

/*      {view === 'date' ? (
        <button onClick={() => setView('time')}>Switch to Time View</button>
      ) : (
        <button onClick={() => setView('date')}>Switch to Date View</button>
      )}

      {view === 'time' ? TimeViewGallery({}) : Image_View_ByDate({})}
*/

import { useState, useEffect, useMemo } from 'react';

import Image_View_ByDate from '@/components/Trip_View/Date_View/Image_View_ByDate';
import TimeViewGallery from '@/components/Trip_View/Time_View/Time_View_Gallery';

import Image_View_ByDateUntimed from './Date_View/ImageViewByDateUntimed';
import TimeViewGalleryUntimed from './Time_View/TimeViewGalleryUntimed';

import { CompareViewStore } from './Compare_View/CompareStore';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { FaClock, FaCalendar, FaPlus, FaTimes } from 'react-icons/fa';

import { useQuery } from '@tanstack/react-query';
import {
  tripViewStore,
  useQueryTrip,
  useQueryTripImages,
} from './Trip_View_Image_Store';

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

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(useContext(TripContext).id);

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

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(useContext(TripContext).id);

  //find the earliest date
  useEffect(() => {
    if (!images) return;

    let earliest_date = new Date(images[0].created_at);

    images.forEach((image) => {
      const current_date = new Date(image.created_at);

      if (current_date < earliest_date) {
        earliest_date = current_date;
      }
    });

    CompareViewStore.setState((state) => {
      return { ...state, untimed_trips_selected_date: earliest_date };
    });
  }, [images]);

  const [openCalendar, setOpenCalendar] = useState(false);

  const candidate_dates = useMemo(() => {
    //Pretty much, return a list of every unique date in the images

    const unique_dates: Date[] = [];

    if (!images) return [];

    let last_saw_date = new Date(images[0].created_at);

    unique_dates.push(last_saw_date);

    images.forEach((image) => {
      const current_date = new Date(image.created_at);

      if (current_date.toDateString() !== last_saw_date.toDateString()) {
        unique_dates.push(current_date);
        last_saw_date = current_date;
      }
    });

    return unique_dates;
  }, [images]);

  const handleDateChange = (date: Date) => {
    CompareViewStore.setState((state) => ({
      ...state,
      untimed_trips_selected_date: date,
    }));
  };

  const innerMinusOuter = () => {
    const outer = document.getElementById('outer');
    const inner = document.getElementById('inner');

    if (outer && inner) {
      outer.scrollTop = inner.offsetTop - 100;
    }
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    // Disable tiles that are not in candidateDates
    if (view === 'month') {
      const candidateDates = candidate_dates;

      return !candidateDates.some(
        (candidateDate) =>
          candidateDate.getFullYear() === date.getFullYear() &&
          candidateDate.getMonth() === date.getMonth() &&
          candidateDate.getDate() === date.getDate()
      );
    }
    return false;
  };

  return (
    <div
      className="text-center w-full flex flex-wrap max-h-full h-full "
      id="outer"
    >
      {/* Should be Singular Row with justify space around*/}
      <div
        id="outer"
        className="w-full flex flex-row items-center overflow-x-scroll "
      >
        <div className=" flex justify-center pl-8 pr-8">
          <div className="relative inline-flex items-center ">
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
                    <FaCalendar size={30} />
                    Date View
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-center pl-5 pr-5">
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
                <FaPlus size={30} />
              </div>
            </button>
          </div>
        </div>
        <div className="flex justify-center pl-5 pr-5">
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
        {/* If Trip is untimed, add a calendar component that does this:
          1. Blacks out dates without an image (only candidate dates available)
          2. When selected -> sets compareViewStore -> untimed_trips_selected_date
        */}
        {trip?.untimed_trips && (
          <div className="relative w-full flex justify-center p-4">
            <FaCalendar onClick={() => setOpenCalendar(true)} />
            {openCalendar && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative bg-white p-4 rounded-lg shadow-lg z-50">
                  <div className="flex justify-end">
                    <FaTimes
                      onClick={() => setOpenCalendar(false)}
                      className="cursor-pointer"
                    />
                  </div>
                  <Calendar
                    onChange={(value, event) => {
                      console.log(value);
                      console.log('event', event);
                      handleDateChange(value as Date);
                      setOpenCalendar(false);
                    }}
                    tileDisabled={tileDisabled}
                    value={CompareViewStore.state.untimed_trips_selected_date}
                    onActiveStartDateChange={(date) => {
                      console.log('Active Start Date Change', date);

                      //disregard whether prev2 prev1, or next2, next1

                      //return if activateStartDate is not a date
                      if (!(date.activeStartDate instanceof Date)) return;

                      //check if either prev1 or prev2
                      if (date.action === 'prev' && date.view === 'month') {
                        //set the month to the previous month where a candidate date exists
                        const candidateDates = candidate_dates.reverse(); //-- should be in reverse order
                        for (let candidateDate of candidateDates) {
                          //check if the candidate date is before the activeStartDate
                          if (candidateDate < date.activeStartDate) {
                            date.activeStartDate.setMonth(
                              candidateDate.getMonth()
                            );
                            date.activeStartDate.setFullYear(
                              candidateDate.getFullYear()
                            );
                            return;
                          }
                        }
                        //if all fail - you can set it to the last candidate date
                        date.activeStartDate.setMonth(
                          candidateDates[candidateDates.length - 1].getMonth()
                        );
                        date.activeStartDate.setFullYear(
                          candidateDates[
                            candidateDates.length - 1
                          ].getFullYear()
                        );
                      }

                      //check if either next1 or next2
                      if (date.action === 'next' && date.view === 'month') {
                        //set the month to the next month where a candidate date exists
                        const candidateDates = candidate_dates;
                        for (let candidateDate of candidateDates) {
                          //check if the candidate date is before the activeStartDate
                          if (candidateDate > date.activeStartDate) {
                            date.activeStartDate.setMonth(
                              candidateDate.getMonth()
                            );
                            date.activeStartDate.setFullYear(
                              candidateDate.getFullYear()
                            );
                            return;
                          }
                        }
                        //if all fail - you can set it to the last candidate date
                        date.activeStartDate.setMonth(
                          candidateDates[candidateDates.length - 1].getMonth()
                        );
                        date.activeStartDate.setFullYear(
                          candidateDates[
                            candidateDates.length - 1
                          ].getFullYear()
                        );
                      }

                      console.log('Active Start Date Change', date);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Display untimed or timed based on trip field */}

      <div className={`max-h-full flex flex-col flex-wrap w-full`}>
        {
          //trip.untimed_trips ? <TimeViewGalleryUntimed /> : <TimeViewGallery />
          trip?.untimed_trips ? (
            <div
              className="  justify-center w-full h-full bg-white rounded-b-lg shadow-lg border border-gray-300"
              style={{ maxHeight: 'calc(100vh - 60px)' }}
            >
              {date_or_time_view === 'time' ? (
                <TimeViewGalleryUntimed />
              ) : (
                <Image_View_ByDateUntimed />
              )}
            </div>
          ) : (
            <div className=" w-full flex flex-wrap justify-center  bg-white rounded-b-lg shadow-lg border border-gray-300">
              {date_or_time_view === 'time' ? (
                <TimeViewGallery />
              ) : (
                <Image_View_ByDate />
              )}
            </div>
          )
        }
      </div>
    </div>
  );
};

//w-full flex flex-wrap justify-center  bg-white rounded-b-lg shadow-lg border border-gray-300"

export default SelectionComponentGallery;
