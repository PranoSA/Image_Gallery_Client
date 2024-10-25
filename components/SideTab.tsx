import React, { useEffect, useState } from 'react';

import {
  FaArrowRight,
  FaArrowLeft,
  FaArrowDown,
  FaArrowUp,
} from 'react-icons/fa';
import {
  useFetchMyTrips,
  useTripViewStore,
  tripViewStore,
} from './Trip_View/Trip_View_Image_Store';

import { History } from '@/definitions/Trip_View';

import Link from 'next/link';

const SampeHistory: History = {
  type: 'mapWithTimeView',
  tripId: '0cbd0581-2a50-43b1-9ecd-62412bb8de4e',
  scrolled_date: new Date(),
  setZoom: 10,
  setCenter: { lat: 312541, lng: 23121 },
  link: '/trip/1/map?view=time&zoom=10&center=312541,23121&date=2021-12-12',
};

const SampleHistories: History[] = [
  SampeHistory,
  {
    type: 'categorizeView',
    tripId: 'c6ef3ed9-3019-417c-b949-dea05773f4e0',
    scrolled_date: null,
    setZoom: null,
    setCenter: null,
    link: '/trip/1?view=category',
  },
  SampeHistory,
];

const SideTab = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [viewTrips, setViewTrips] = useState(false);

  const [openMapSettings, setOpenMapSettings] = useState(false);

  const [openHistory, setOpenHistory] = useState(false);

  const toggleTab = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <div
        className="fixed top-0 left-0 h-full transition-transform duration-300"
        style={{ zIndex: 1000 }}
      >
        <div
          className="absolute top-0 left-0 h-full w-8 cursor-pointer flex items-center justify-center"
          onClick={toggleTab}
        >
          <FaArrowRight
            className="text-white dark:text-neon-purple cursor-pointer hover:text-neon-blue"
            size={30}
            title="Settings"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 left-0 h-full transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-56'
      } overflow-y-auto  `}
      style={{ zIndex: 1000 }}
    >
      <div className="flex items-start justify-center h-full bg-gray-800 text-white shadow-lg">
        <div className="flex flex-row items-start">
          <div className="flex flex-col w-72 p-4 ">
            <div className="flex flex-col space-y-4 dark:text-white  ">
              <div className="relative border-b border-gray-600 pb-2 flex-row mt-20">
                <h2 className="text-lg font-bold dark:text-white">TRIPS</h2>
                {viewTrips ? (
                  <FaArrowUp
                    className="absolute left-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setViewTrips(false)}
                  />
                ) : (
                  <FaArrowDown
                    className="absolute right-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setViewTrips(true)}
                  />
                )}
                {viewTrips && <TripList />}
              </div>

              <div className="relative border-b border-gray-600 pb-2 flex-row">
                <h2 className="text-lg font-bold dark:text-white">
                  Recently Viewed
                </h2>
                {openHistory ? (
                  <FaArrowUp
                    className="absolute left-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setOpenHistory(false)}
                  />
                ) : (
                  <FaArrowDown
                    className="absolute right-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setOpenHistory(true)}
                  />
                )}
                {openHistory && <HistoryList />}
              </div>

              <div className="relative border-b border-gray-600 pb-2 flex-row">
                <h2 className="text-lg font-bold dark:text-white">
                  Map Settings
                </h2>
                {openMapSettings ? (
                  <FaArrowUp
                    className="absolute left-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setOpenMapSettings(false)}
                  />
                ) : (
                  <FaArrowDown
                    className="absolute right-5 top-2 text-white dark:text-neon-blue cursor-pointer"
                    onClick={() => setOpenMapSettings(true)}
                  />
                )}
                {openMapSettings && <MapSettingPanel />}
              </div>
            </div>
          </div>
          <FaArrowLeft
            className="text-white dark:text-neon-purple cursor-pointer mt-[50vh]"
            onClick={toggleTab}
            size={30}
          />
        </div>
      </div>
      <div
        className="absolute top-0 left-full h-full w-8 bg-gray-800 cursor-pointer"
        onClick={toggleTab}
      ></div>
    </div>
  );
};

const TripList = () => {
  const { data: trips, isLoading, isError } = useFetchMyTrips();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error!</p>;
  }

  if (!trips || trips.length === 0) {
    return <p>No trips found.</p>;
  }

  return (
    <div className="flex flex-col space-y-4 max-h-[35vh] overflow-y-auto">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="flex flex-col items-center space-y-2 p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          <p className="font-semibold">{trip.name}</p>
          <Link
            href={`/trip/${trip.id}`}
            className="text-blue-500 hover:underline"
          >
            View
          </Link>
          {trip.untimed_trips ? (
            <h1 className="text-sm text-gray-400">Untimed Trip</h1>
          ) : (
            <h1 className="text-sm text-gray-400">
              {trip.start_date} - {trip.end_date}
            </h1>
          )}
        </div>
      ))}
    </div>
  );
};

const TypeToStringRepresentation = (type: History['type']) => {
  switch (type) {
    case 'mapWithTimeView':
      return 'Map View';
    case 'mapWithDateView':
      return 'Map View';
    case 'compareView':
      return 'Comparing Images';
    case 'categorizeView':
      return 'Categorizing Images';
    case 'undatedView':
      return 'Undated Images';
    case 'unLocatedView':
      return 'Unlocated Images';
    case 'PlainView':
      return 'Image Gallery';
  }
};

const HistoryList = () => {
  //history will be stored at local storage as a json array

  const [histories, setHistories] = useState<History[]>(SampleHistories);

  const {
    data: trips,
    isLoading: tripsLoading,
    isError: tripsError,
  } = useFetchMyTrips();

  useEffect(() => {
    const histories = localStorage.getItem('histories');
    if (histories) {
      setHistories(JSON.parse(histories));
    }
  }, []);

  if (histories.length == 0) {
    return <p>No history found.</p>;
  }

  /**
   *
   * Things You Need to Display
   * The Page [Comparing, Categorizing, Plain, Undated, Unlocated, Map]
   * The Name of the Trip
   * The Date inside the Trip
   * In The Future -> Add Ability to Fetch A Single Image
   *
   *
   * Things You Do Not Need to Display
   * The Zoom Level
   * The Center
   */

  return (
    <div className="flex flex-col space-y-4 max-h-[35vh] overflow-y-auto">
      {histories.map((history) => (
        <div
          key={history.link}
          className="flex flex-col items-center space-y-2 p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          <p className="font-semibold">
            {trips?.find((trip) => trip.id === history.tripId)?.name}
          </p>

          <p className="font-semibold">
            {TypeToStringRepresentation(history.type)}
          </p>
          <Link href={history.link} className="text-blue-500 hover:underline">
            View
          </Link>
          {history.scrolled_date && (
            <h1 className="text-sm text-gray-400">
              Scrolled Date: {history.scrolled_date.toDateString()}
            </h1>
          )}
        </div>
      ))}
    </div>
  );
};

const MapSettingPanel = () => {
  /**
   *
   * This Should Model Closely to the Map Settings Panel
   */

  const {
    comparing_photos,
    paths_open,
    map_open,
    day_by_day_banners,
    horizontally_tabbed,
    zoom_on_day_change,
    image_heat_map,
    filtering_images,
    show_convex_hull,
    show_categories_on_map,
  } = useTripViewStore();

  return (
    <div className="z-50 origin-top-right absolute max-h-[35vh] left-0 mt-2 w-64 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 pb-20 overflow-y-auto">
      <div
        className="py-2 px-4"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={comparing_photos}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                comparing_photos: !state.comparing_photos,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">
            {comparing_photos ? 'Stop Comparing Photos' : 'Compare Photos'}
          </span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={paths_open}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                paths_open: !state.paths_open,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Show Paths</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={map_open}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                map_open: !state.map_open,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Show Map</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={horizontally_tabbed}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                horizontally_tabbed: !state.horizontally_tabbed,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Horizontal Tabbing</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={zoom_on_day_change}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                zoom_on_day_change: !state.zoom_on_day_change,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Zoom On Day Change</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={filtering_images}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                filtering_images: !state.filtering_images,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">
            Display Category Legend
          </span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={image_heat_map}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                image_heat_map: !state.image_heat_map,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Enable Image Heat Map</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={show_convex_hull}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                show_convex_hull: !state.show_convex_hull,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Show Convex Hull</span>
        </label>
        <label className="flex items-center space-x-3 mb-2">
          <input
            type="checkbox"
            checked={show_categories_on_map}
            onChange={() =>
              tripViewStore.setState((state) => ({
                ...state,
                show_categories_on_map: !state.show_categories_on_map,
              }))
            }
            className="form-checkbox h-5 w-5 text-neon-green bg-gray-800 border-gray-700"
          />
          <span className="text-neon-green text-sm">Categories On Map</span>
        </label>
      </div>
    </div>
  );
};

export default SideTab;