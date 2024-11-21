'use client';

import {
  Image as Image,
  Trip,
  Category,
  History,
} from '@/definitions/Trip_View';

import {
  CompareViewStore,
  useCompareViewStore,
} from '@/components/Trip_View/Compare_View/CompareStore';

import AddImagesForm from '@/components/Trip_View/AddImagesForm';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ImageUploadModal from '@/components/ImageUploadModal';

import { signIn, useSession } from 'next-auth/react';

import { QueryClientProvider } from '@tanstack/react-query';
import TripContext from '@/components/TripContext';

//back arrow icon
import { FaArrowLeft, FaDownload, FaHome, FaPlus } from 'react-icons/fa';

//comparison or swap icon
import { FaExchangeAlt } from 'react-icons/fa';

//Map Icon
import { FaMap } from 'react-icons/fa';

import {
  useQueryTrip,
  useQueryTripImages,
  useQueryTripPaths,
  useTripViewStore,
  tripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { dateFromString } from '@/components/Trip_View/Time_Functions';

import { Banner_Component } from '@/components/Trip_View/Banner_Component';
import NextImage from 'next/image';

//import folder icon from FaIcons
import { FaChevronUp, FaFolder } from 'react-icons/fa';

import AddCategoryForm from '@/components/Trip_View/Compare_View/AddCategoryModal';

//import trash icon from FaIcons
import { FaTrash } from 'react-icons/fa';

//import icon that intuitively looks like "open up"
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

import UntimedImagesView from '@/components/Trip_View/Compare_View/UntimedImagesView';
import UnlocatedImagesView from '@/components/Trip_View/Compare_View/UnlocatedImages';
import CategoryView from '@/components/Trip_View/Compare_View/CategoryView';
import SelectionCompare from '@/components/Trip_View/Compare_View/SelectionCompare';

import PlainViewUntimed from '@/components/Trip_View/Compare_View/Plain_View_Untimed';

import CategoryViewUntimedTrips from '@/components/Trip_View/Compare_View/Untimed_Compare_View/CategoryViewUntimed';

import { queryClient } from '@/components/Trip_View/Trip_View_Image_Store';
import { useRouter } from 'next/router';
import PlainView from '@/components/Trip_View/Compare_View/Plain_View';
import { FaPencil } from 'react-icons/fa6';
import { init } from 'next/dist/compiled/webpack/webpack';

import PlainViewTimed from '@/components/Trip_View/Compare_View/Untimed_Compare_View/Plain_View_Timed';
import { json } from 'stream/consumers';
import SideTab from '@/components/SideTab';

const useTripContext = (): {
  id: string;
  bearer_token: string | null;
  setBearerToken: (token: string) => void;
  scrollToImage: (image: any) => void;
} => {
  return useContext(TripContext);
};

interface TripProviderProps {
  children: React.ReactNode;
  id: string;
}

const TripProvider = ({ children, id }: TripProviderProps) => {
  const [bearer_token, setBearerToken] = useState<string | null>(null);

  const setBearerTokenFunction = (token: string) => {
    setBearerToken(token);
  };

  return (
    <TripContext.Provider
      value={{
        id,
        bearer_token,
        setBearerToken: setBearerTokenFunction,
        scrollToImage(image) {},
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  return (
    <TripProvider id={id || '0'}>
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    </TripProvider>
  );
};

const Page = () => {
  const { id } = useTripContext();

  const {
    mode,
    compare_or_filter_stage,
    compared_image_indexes,
    filtered_image_indexes,
  } = useCompareViewStore();

  const { untimed_trips_selected_date } = useCompareViewStore();

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  const { selected_date } = useTripViewStore();

  const { update, data, status } = useSession();

  const [addImagesOpen, setAddImagesOpen] = useState(false);

  useEffect(() => {
    const session = data;

    //store the access token in local storage
    if (session?.accessToken) {
      localStorage.removeItem('accessToken');
      localStorage.setItem('accessToken', session.accessToken);
    }
    //setBearerToken(session?.accessToken || '');
    //set tripContext bearer token
  }, [data]);

  const initialized = useRef(0);

  //on-mount -> Use query parameters to set the selected date and selected mode
  useEffect(() => {
    initialized.current = 0;
    const urlParams = new URLSearchParams(window.location.search);

    const date_param = urlParams.get('date');
    //check if is formatted like a date or number
    const is_date = date_param?.includes('-') || date_param?.includes('/');

    const mode = urlParams.get('mode');
    console.log('URL Parameters:', Array.from(urlParams.entries()));
    if (is_date) {
      const date = Array.from(urlParams.entries()).find(
        ([key, value]) => key === 'date'
      )?.[1];
      if (!date) return;
      //create new date - that is offseted by timezone
      const new_date = new Date(date);
      const offset = new_date.getTimezoneOffset();
      new_date.setMinutes(new_date.getMinutes() + offset);

      console.log('Date is', date.replace('-', '/'));
      CompareViewStore.setState((state) => ({
        ...state,
        untimed_trips_selected_date: new Date(new_date) || new Date(),
      }));
    } else {
      const date = parseInt(urlParams.get('date') || '0');
      if (!date) return;

      tripViewStore.setState((state) => ({
        ...state,
        selected_date: date,
      }));
    }

    if (mode) {
      CompareViewStore.setState((state) => ({
        ...state,
        mode: mode as 'sort' | 'undated' | 'unlocated' | 'view' | 'compare',
      }));
    }

    initialized.current = 1;
  }, []);

  //set the query parameters when the selected date or mode changes
  useEffect(() => {
    if (!initialized.current) return;

    //return if its obvious selected_date and mode has not been set yet
    const initial_selection =
      selected_date === 0 && mode === 'sort' && !trip?.untimed_trips;

    if (initialized.current < 3 && initial_selection) {
      console.log('returning');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (trip?.untimed_trips) {
      console.log('setting untimed_trips_selected_date');
      urlParams.set(
        'date',
        untimed_trips_selected_date.toISOString().split('T')[0]
      );
    } else {
      urlParams.set('date', selected_date.toString());
    }
    urlParams.set('mode', mode);

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${urlParams}`
    );

    initialized.current = initialized.current + 1;
  }, [selected_date, mode, trip?.untimed_trips, untimed_trips_selected_date]);

  const setMode = (
    mode: 'sort' | 'undated' | 'unlocated' | 'view' | 'compare'
  ) => {
    CompareViewStore.setState((state) => ({
      ...state,
      mode,
    }));
  };

  //useEffect to update history object
  useEffect(() => {
    const last_history: History[] =
      JSON.parse(localStorage.getItem('history') || '[]') || [];

    const last_entry: History = last_history[0];

    //overlapping views or views that are part of this page 'sort', 'undated', 'unlocated', 'view'
    const overlapping_views: History['type'][] = [
      'categorizeView',
      'undatedView',
      'unLocatedView',
      'PlainView',
      'compareView',
    ];

    const MapToType: { [key in typeof mode]: History['type'] } = {
      sort: 'categorizeView',
      undated: 'undatedView',
      unlocated: 'unLocatedView',
      view: 'PlainView',
      compare: 'compareView',
    };

    const is_new =
      last_entry === undefined ||
      last_entry.tripId !== id ||
      !overlapping_views.includes(last_entry.type);

    console.log('is_new', is_new);
    console.log(last_entry);
    if (is_new) {
      const new_entry: History = {
        type: MapToType[mode],
        tripId: id,
        scrolled_date: new Date(),
        setZoom: null,
        setCenter: null,
        link: `/trip/${id}?date=${selected_date}&mode=${mode}`,
      };

      const new_history = [new_entry, ...last_history];

      localStorage.setItem('history', JSON.stringify(new_history));
    } else {
      //edit the first entry
      last_entry.tripId = id;
      last_entry.type = MapToType[mode];
      last_entry.link = `/trip/${id}?date=${selected_date}&mode=${mode}`;

      const new_history = [last_entry, ...last_history.slice(1)];

      localStorage.setItem('history', JSON.stringify(new_history));
    }
  }, [id, mode, selected_date]);

  /**
   * Create a Navarbar that helps you select a mode
   * If Mode is sort -> Then use CategoryView Component
   * If Mode is undated -> Then use UntimedImagesView Component
   * If Mode is unlocated -> Then use UnlocatedImagesView Component
   * If Mode is view -> Then for now -> Just say "view" -> not sure what to do here
   */

  const renderContent = () => {
    if (!trip) {
      return <div>Loading...</div>;
    }

    if (trip.untimed_trips) {
      switch (mode) {
        case 'sort':
          return <CategoryViewUntimedTrips />;
        case 'undated':
          return <UntimedImagesView />;
        case 'unlocated':
          return <UnlocatedImagesView />;
        case 'view':
          return <PlainViewTimed />;
        case 'compare':
          return <SelectionCompare />;
        default:
          return null;
      }
    }

    switch (mode) {
      case 'sort':
        return <CategoryView />;
      case 'undated':
        return <UntimedImagesView />;
      case 'unlocated':
        return <UnlocatedImagesView />;
      case 'view':
        return <PlainView />;
      case 'compare':
        return <SelectionCompare />;
      default:
        return null;
    }
  };
  //const router = useRouter();

  //check if authenticated
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    //direct to login page
    //using Keycloak
    signIn('keycloak');
  }

  //go back
  const goBack = () => {
    //go to /trip/${id}
    //window.location.href = `/trip/${id}`;
    //load the page /trip/${id} --> not using window.history
    //use router to go back
    // router.push(`/trip/${id}`);
    window.location.href = '/'; //`/trip/${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-scroll dark:bg-black">
      <nav className="bg-blue-500 p-4 shadow-md w-full overflow-x-auto dark:bg-blue-800">
        <div className="flex flex-nowrap items-center space-x-4">
          {/* Back button */}
          <SideTab />
          <FaHome
            className="text-white text-2xl cursor-pointer"
            onClick={goBack}
            title="Back To Home"
            size={30}
          />
          {/* Modal to Add New Images type ImageUploadModalProps = {
  tripId: string;
};*/}
          <ImageUploadModal tripId={id} />
          {/* Plus Icon To Add New Image */}
          <div className="pl-4 pr-4">
            <div
              onClick={() => {
                tripViewStore.setState((state) => {
                  return { ...state, adding_images: true };
                });
              }}
              className="cursor-pointer flex flex-row items-center rounded-lg px-4 py-2 justify-center gap-1 hover:bg-blue-600 dark:bg-blue-800"
            >
              <FaPlus
                className="hover:text-blue-700 transition-colors duration-50 dark:text-neon-blue"
                title="Add Images"
                size={30}
              />
              <div className="text-white pl-2">Add Images</div>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'sort'
                ? 'bg-blue-700 dark:bg-blue-500'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-800'
            }`}
            onClick={() => setMode('sort')}
            title="Categorize Images"
          >
            Sort
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'undated'
                ? 'bg-blue-700 dark:bg-blue-500'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-800'
            }`}
            onClick={() => setMode('undated')}
            title="View Images Without Date"
          >
            Undated
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'unlocated'
                ? 'bg-blue-700 dark:bg-blue-500'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-800'
            }`}
            onClick={() => setMode('unlocated')}
            title="View Images Without Location"
          >
            Unlocated
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'view'
                ? 'bg-blue-700 dark:bg-blue-500'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-800'
            }`}
            onClick={() => setMode('view')}
            title="View All Sorted By Time"
          >
            View
          </button>
          {/* Compare Button */}
          <div className="pr-4 pl-6">
            <FaExchangeAlt
              className="bg-blue-500 hover:bg-blue-600 text-white hover:text-black rounded-lg dark:bg-blue-800"
              onClick={() => {
                setMode('compare');
              }}
              title="Compare and Pick"
              size={30}
            />
          </div>
          {/* Map Icon + View Map*/}
          <div className="pr-4 pl-4">
            <FaMap
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 text-white hover:text-black rounded-lg"
              onClick={() => {
                window.location.href = `/trip/${id}/map`;
              }}
              title="Map View"
              size={30}
            />
          </div>
          <div className="flex flex-row items-center gap-2 pr-4 pl-4">
            <FaDownload
              className="text-white text-2xl cursor-pointer"
              onClick={async () => {
                // Make a request to download_begin to create a temp link
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/download_begin`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        'accessToken'
                      )}`,
                    },
                  }
                );

                if (!res.ok) {
                  console.error('Error creating temp link');
                  return;
                }

                const responseData = await res.json();
                const code = responseData[0].id;

                const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/trip/${code}/download`;

                // Fetch the file and create a blob
                const downloadRes = await fetch(downloadUrl);
                if (!downloadRes.ok) {
                  console.error('Error downloading file');
                  return;
                }

                const blob = await downloadRes.blob();
                const url = window.URL.createObjectURL(blob);

                // Create a temporary anchor element to trigger the download
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `trip_${code}.zip`;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);

                // Revoke the object URL to free up memory
                window.URL.revokeObjectURL(url);
              }}
              title="Download Images"
            />
          </div>
        </div>
      </nav>

      <div className="container mx-auto">{renderContent()}</div>
    </div>
  );
};

export default PageWithProvider;
