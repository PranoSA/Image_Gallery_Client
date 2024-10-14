'use client';

import { Image as Image, Trip, Category } from '@/definitions/Trip_View';

import {
  CompareViewStore,
  useCompareViewStore,
} from '@/components/Trip_View/Compare_View/CompareStore';

import AddImagesForm from '@/components/Trip_View/AddImagesForm';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { signIn, useSession } from 'next-auth/react';

import { QueryClientProvider } from '@tanstack/react-query';
import TripContext from '@/components/TripContext';

//back arrow icon
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

import CategoryViewOld from '@/components/Trip_View/Compare_View/CategoryViewOld';

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
import { queryClient } from '../../../components/Trip_View/Trip_View_Image_Store';
import { useRouter } from 'next/router';
import PlainView from '@/components/Trip_View/Compare_View/Plain_View';
import { FaPencil } from 'react-icons/fa6';

const useTripContext = () => {
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
      value={{ id, bearer_token, setBearerToken: setBearerTokenFunction }}
    >
      {children}
    </TripContext.Provider>
  );
};

const ItemTypes = {
  IMAGE: 'image',
};

//save categorized trip
const saveCategorizedTrip = async (trip: Trip) => {
  const api_url = `${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}`;

  const res = await axios.put(api_url, trip);

  return res.data;

  fetch(api_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trip),
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
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

  const setMode = (
    mode: 'sort' | 'undated' | 'unlocated' | 'view' | 'compare'
  ) => {
    CompareViewStore.setState((state) => ({
      ...state,
      mode,
    }));
  };

  /**
   * Create a Navarbar that helps you select a mode
   * If Mode is sort -> Then use CategoryView Component
   * If Mode is undated -> Then use UntimedImagesView Component
   * If Mode is unlocated -> Then use UnlocatedImagesView Component
   * If Mode is view -> Then for now -> Just say "view" -> not sure what to do here
   */

  const renderContent = () => {
    switch (mode) {
      case 'sort':
        return <CategoryView />;
      case 'undated':
        return <UntimedImagesView />;
      case 'unlocated':
        return <UnlocatedImagesView />;
      case 'view':
        return <PlainView />;
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
    window.location.href = ''; //`/trip/${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 p-4 shadow-md">
        <div className="container mx-auto flex justify-around">
          {/* back button */}
          <FaArrowLeft
            className="text-white text-2xl cursor-pointer"
            onClick={goBack}
          >
            Back
          </FaArrowLeft>

          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'sort' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => setMode('sort')}
          >
            Sort
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'undated'
                ? 'bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => setMode('undated')}
          >
            Undated
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'unlocated'
                ? 'bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => setMode('unlocated')}
          >
            Unlocated
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              mode === 'view' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={() => setMode('view')}
          >
            View
          </button>
          {/* Map Icon + View Map*/}
          <div className="">
            <FaMap
              className={`'bg-blue-500 hover:bg-blue-600 text-white hover:text-black rounded-lg`}
              onClick={() => {
                window.location.href = `/trip/${id}/map`;
              }}
              size={30}
            >
              View Map
            </FaMap>
          </div>
        </div>
      </nav>
      <div className="w-1/4 flex flex-col items-center justify-center">
        {/* Modal to Add New Images */}
        <AddImagesForm />
        {/* Plus Icon To Add New Image */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              tripViewStore.setState((state) => {
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
      <div className="container mx-auto p-4">{renderContent()}</div>
    </div>
  );
};

export default PageWithProvider;
