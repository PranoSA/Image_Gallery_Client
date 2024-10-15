/**
 *
 * This component will have things like
 *
 * 1. Open Form For Comparin Photos
 * 2. Open Form for Setting Dates on Undated Photos
 * 3. Open Form for Adding Photos
 * 4. Open Form For Adding Paths
 * 5. Open Page to View All Paths
 * 3. Open Form for setting geolocation on photos without geolocation
 * 3. Checkbox to Showing Map
 * 4. Checkbox for showing paths
 * 5. Checkbox for "Zoom On Day Change"
 * 6. Checkbox for Image Heat Map
 * 7. Checkbox For Show Day By Day Banners
 *
 *
 */

import React, { useState, useContext } from 'react';

import {
  tripViewStore,
  useTripViewStore,
  useQueryTrip,
  useQueryTripPaths,
  useQueryTripImages,
} from './Trip_View_Image_Store';
import TripContext from '../TripContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import Modal from '@/components/PathModal';

//import Link Icon from react-icons/fa
import { FaExternalLinkAlt } from 'react-icons/fa';
//Home Icon
import { FaHome } from 'react-icons/fa';

import Link from 'next/link';

export const TripDropdownMenu: React.FC = () => {
  const [menu, setMenu] = useState(false);

  const id = useContext(TripContext).id;

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  const toggleMenu = () => {
    setMenu(!menu);
  };

  const {
    map_open,
    day_by_day_banners,
    paths_open,
    zoom_on_day_change,
    image_heat_map,
    comparing_photos,
    filtering_images,
    horizontally_tabbed,
  } = useTripViewStore();

  //maybe comparing photos should be a new page?
  // for now , just have it on the same page
  //
  {
    /* Make Absolute position on the top right of the page */
  }
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {menu ? 'Close Menu' : 'Open Menu'}
        {menu ? (
          <FaChevronUp className="ml-2" />
        ) : (
          <FaChevronDown className="ml-2" />
        )}
      </button>
      {/**
       *
       *    Here is the dropdown menu for all the things listed at the top of the file
       *
       *  * 1. Open Form For Comparin Photos
       * 2. Open Form for Setting Dates on Undated Photos
       * 3. Open Form for Adding Photos
       * 4. Open Form For Adding Paths
       * 5. Open Page to View All Paths
       * 3. Open Form for setting geolocation on photos without geolocation
       * 3. Checkbox to Showing Map
       * 4. Checkbox for showing paths
       * 5. Checkbox for "Zoom On Day Change"
       * 6. Checkbox for Image Heat Map
       * 7. Checkbox For Show Day By Day Banners
       *
       */}
      {menu && (
        <div className="z-50 origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={comparing_photos}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      comparing_photos: !state.comparing_photos,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {comparing_photos ? 'Stop Comparing Photos' : 'Compare Photos'}
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={paths_open}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      paths_open: !state.paths_open,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">{'Show Paths'}</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={map_open}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      map_open: !state.map_open,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">{'Show Map'}</span>
            </label>
            {/* day by day banners checkbox*/}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={day_by_day_banners}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      day_by_day_banners: !state.day_by_day_banners,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {'Show Day By Day Banners'}
              </span>
            </label>
            {/* Horizontal Tabbing */}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={horizontally_tabbed}
                onChange={() => {
                  const new_state = {
                    ...tripViewStore.state,
                    horizontally_tabbed: !horizontally_tabbed,
                  };

                  tripViewStore.setState((state) => {
                    return new_state;
                  });
                }}
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {'Horizontal Tabbing'}
              </span>
            </label>

            {/* zoom on day change checkbox*/}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={zoom_on_day_change}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      zoom_on_day_change: !state.zoom_on_day_change,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {'Zoom On Day Change'}
              </span>
            </label>
            {/* Display Category Legend*/}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filtering_images}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      filtering_images: !state.filtering_images,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {'Display Category Legend'}
              </span>
            </label>

            {/* image heat map checkbox*/}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={image_heat_map}
                onChange={() =>
                  tripViewStore.setState((state) => {
                    return {
                      ...state,
                      image_heat_map: !state.image_heat_map,
                    };
                  })
                }
                className="form-checkbox h-5 w-5 text-gray-600"
              />
              <span className="text-gray-700 text-sm">
                {'Enable Image Heat Map'}
              </span>
            </label>
            {/*<Modal />*/}
            {/* No Longer check-boxes - this next one is a button to set add_path to true to open the form */}
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() =>
                tripViewStore.setState((state) => {
                  return {
                    ...state,
                    adding_path: !state.adding_path,
                  };
                })
              }
            >
              {'Add Path'}
            </button>
          </div>
        </div>
      )}

      {/*menu && (
        <div className="z-50 origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={() => setComparingPhotos(!comparingPhotos)}
            >
              {comparingPhotos ? 'Stop Comparing Photos' : 'Compare Photos'}
            </button>
            <Modal
              isOpen={pathModalOpen}
              onClose={() => setPathModalOpen(!pathModalOpen)}
              onSubmit={submitModal}
            />
          </div>
        </div>
      )*/}
    </div>
  );
};
