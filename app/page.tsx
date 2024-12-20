'use client';

import '@/globals.css';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import InviteUserToTripForm from '@/components/Home_View/InviteUserToTripForm';
import IntroPage from '@/components/Home_View/IntroPage';
import NextImage from 'next/image';
import ImageUploadModal from '@/components/ImageUploadModal';

import './page.css';

//import query provider
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import {
  tripViewStore,
  useAddImage,
  useGetUploadProgress,
} from '@/components/Trip_View/Trip_View_Image_Store';
import AddImagesForm from '../components/Trip_View/AddImagesForm';
import { Category, Image, Trip } from '@/definitions/Trip_View';
import {
  useFetchMyTrips,
  useTripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { useQueryTripImages } from '@/components/Trip_View/Trip_View_Image_Store';
//pencil faIcon for editing
import { FaPencilAlt } from 'react-icons/fa';

import { FaTimes } from 'react-icons/fa';

//sign out icon
import { FaSignOutAlt } from 'react-icons/fa';

//add person icon for inviting users
import { FaUserPlus } from 'react-icons/fa';

//icon for adding images
import { FaPlus } from 'react-icons/fa';
//image upload icon
import { FaImage } from 'react-icons/fa';

import { queryClient } from '@/components/Trip_View/Trip_View_Image_Store';
import SideTab from '@/components/SideTab';

// get server session

//const queryClient = new QueryClient();

//Context Provider For Home Page
export default function HomeProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

type TripSubmitState = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  categories: Category[];
  untimed_trips: boolean;
};

function Home() {
  const [newTrip, setNewTrip] = useState<TripSubmitState>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    categories: [],
    untimed_trips: false,
  });
  const [showForm, setShowForm] = useState(false);

  //id of trip to invite user to
  // if null, then no form is shown
  const [inviteForm, setInviteForm] = useState<Trip | null>(null);

  const {
    data: trips,
    status: tripsStatus,
    error: tripsError,
  } = useFetchMyTrips();

  const { adding_images } = useTripViewStore();

  const closeInviteForm = () => {
    setInviteForm(null);
  };

  //login status
  const { data: session, status } = useSession();

  const [selectedTripUploadImage, setSelectedTripUploadImage] = useState<
    string | null
  >(null);

  /*
  //use effect -> register the service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Registration successful');
        })
        .catch((error) => {
          console.log('Service worker registration failed');
        });
    }
  }, []);

  //subscribe to push notifications
  async function requestPushPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Push notification permission granted.');
        // Subscribe to push notifications here
      } else {
        console.log('Push notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.addEventListener('DOMContentLoaded', () => {
      // Request push notification permission when the page loads
      requestPushPermission();
    });

    if ('serviceWorker' in navigator) {
      const handleServiceWorker = async () => {
        const register = await navigator.serviceWorker.register('/sw.js');

        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey: `${process.env.NEXT_PUBLIC_WEBPUSH_PUBLIC_KEY}`,
        });

        console.log('Push Subscription:', subscription);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_WEBPUSH_URL}/subscribe`,
          {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'content-type': 'application/json',
            },
          }
        );

        const data = await res.json();
        console.log(data);
      };
      handleServiceWorker();
    }
  }, []);
  */

  useEffect(() => {
    //set local storage bearer token
    if (typeof window !== 'undefined' && session) {
      localStorage.setItem('accessToken', session.accessToken as string);
      //set date_redeemed -> store unix timestamp
      const now_time = Date.now();
      const unix_time = Math.floor(now_time / 1000);

      localStorage.setItem('date_redeemed', unix_time.toString());
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTrip((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/trips`, newTrip, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setNewTrip({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        categories: [],
        untimed_trips: false,
      });
      setShowForm(false);
      // Fetch trips again to update the list
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/trips`
      );
      //setTrips(response.data);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };
  //get access token from session
  const accessToken = session?.accessToken;

  //if not logged in - redirect to keycloak login page

  //if not logged in, redirect to login page
  if (!session) {
    if (typeof window === 'undefined') {
      return <IntroPage />;
    }

    const last_redeemed = localStorage.getItem('date_redeemed');
    //see if 5 minutes have passed
    if (!last_redeemed) {
      return <IntroPage />;
    }

    const last_redeemed_date = new Date(parseInt(last_redeemed));
    const current_date = new Date();
    const diff = current_date.getTime() - last_redeemed_date.getTime();
    if (diff > 5 * 60 * 1000) {
      return <IntroPage />;
    }

    //return <IntroPage />;
  }

  // show invite modal if inviteForm is not null

  const toggleNewTrip = () => {
    //set untimed_trips to !untimed_trips
    setNewTrip((prev) => ({ ...prev, untimed_trips: !prev.untimed_trips }));
  };

  return (
    <div className="flex flex-wrap flex-row justify-around dark:bg-black">
      {/* signout icon here */}
      <div className="absolute top-5 left-5 z-50" title="Sign Out">
        <FaSignOutAlt
          className="text-gray-500 hover:text-black cursor-pointer transition duration-300 ease-in-out"
          onClick={() => {
            signOut({ callbackUrl: '/' });
            // Remove local storage items
            localStorage.removeItem('accessToken');
            localStorage.removeItem('date_redeemed');
          }}
          size={30}
          title="Sign Out"
        />
      </div>
      {inviteForm && (
        <InviteUserToTripForm
          trip={inviteForm}
          closeInviteForm={closeInviteForm}
        />
      )}
      <div className="z-10 w-full items-center justify-between font-mono text-sm p-5 ">
        <h1 className="text-2xl font-bold text-center dark:text-white">
          My Trips
        </h1>
      </div>
      <div
        className="z-10 w-full flex items-center justify-center font-mono text-sm p-5"
        onClick={() => setShowForm(true)}
      >
        <FaPlus className="text-black hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out dark:text-white" />
        <p className="text-black dark:text-white dark:hover:text-gray-200 font-bold text-lg hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out m-5">
          Create New Trip
        </p>
      </div>
      <TripListCompontent />
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md z-60 max-h-[75vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">New Trip</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newTrip.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTrip.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4 flex flex-col items-center">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="untimed_trips"
                >
                  Untimed Trips
                </label>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    id="untimed_trips"
                    name="untimed_trips"
                    checked={newTrip.untimed_trips}
                    onChange={() => toggleNewTrip()}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="untimed_trips"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              {!newTrip.untimed_trips && (
                <>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-bold mb-2"
                      htmlFor="start_date"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={newTrip.start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-bold mb-2"
                      htmlFor="end_date"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={newTrip.end_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const TripListCompontent = () => {
  //you don't need authetnication context - it will be conditionally rendered

  const { data: trips, status, error } = useFetchMyTrips();

  // when done loading, load the images

  const [editTrip, setEditTrip] = useState<boolean>(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
  const [editTripError, setEditTripError] = useState<string | null>(null);

  const {
    data: upload_progress,
    status: upload_progress_status,
    error: upload_progress_error,
  } = useGetUploadProgress();

  const { adding_images } = useTripViewStore();

  //id of trip to invite user to
  // if null, then no form is shown
  const [inviteForm, setInviteForm] = useState<Trip | null>(null);

  const [selectedTripUploadImage, setSelectedTripUploadImage] = useState<
    string | null
  >(null);
  const addImage = useAddImage();

  if (status === 'pending') {
    return <p>Loading...</p>;
  }

  const handleEditTrip = (trip: Trip) => {
    setEditTrip(true);
    setEditedTrip(trip);
  };

  const handleChangeToTrip = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editedTrip) return;

    const new_trip = {
      ...editedTrip,
      [e.target.name]: e.target.value,
    };

    setEditedTrip({
      ...new_trip,
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    if (typeof window === 'undefined') return;

    //check fields and format
    e.preventDefault();

    //check sanity and fields
    if (editedTrip?.name === '' || editedTrip?.description === '') {
      setEditTripError('Please fill out all fields');
      return;
    }

    //if any fields are undefined or empty
    if (!editedTrip?.start_date || !editedTrip?.end_date) {
      setEditTripError('Please fill out all fields');
      return;
    }

    if (editedTrip?.start_date === '' || editedTrip?.end_date === '') {
      setEditTripError('Please fill out all fields');
      return;
    }

    //check proper date format
    const start_date = new Date(editedTrip?.start_date);

    if (isNaN(start_date.getTime())) {
      setEditTripError('Please enter a valid start date');
      return;
    }

    const end_date = new Date(editedTrip?.end_date);

    if (isNaN(end_date.getTime())) {
      setEditTripError('Please enter a valid end date');
      return;
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/trips/${editedTrip?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(editedTrip),
        }
      );

      setEditTrip(false);
      setEditedTrip(null);
      setEditTripError(null);
    } catch (error) {
      setEditTripError('Error updating trip');
    }
  };

  const editTripModal = (trip: Trip) => {
    return (
      <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="z-60 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg ">
          {/* FORM FOR filling out trip fields, */}

          <form>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedTrip?.name}
                onChange={handleChangeToTrip}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {/* Description */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={editedTrip?.description}
                onChange={handleChangeToTrip}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {/* Start Date */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="start_date"
              >
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={editedTrip?.start_date}
                onChange={handleChangeToTrip}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="end_date"
              >
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={editedTrip?.end_date}
                onChange={handleChangeToTrip}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {editTripError && <p className="text-red-500">{editTripError}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={submitForm}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => {
                setEditTrip(false);
                setEditedTrip(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  };

  const handleAddImagesClick = (trip_id: string | null) => {
    setSelectedTripUploadImage(trip_id);
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_images: true,
      };
    });
  };

  if (!trips) {
    return null;
  }

  const closeInviteForm = () => {
    setInviteForm(null);
  };

  //check errors for fetching trips
  if (status === 'error') {
    return <p>Error loading trips</p>;
  }

  return (
    <div className=" flex flex-wrap w-full  p-5">
      <SideTab />
      <div className="w-full z-100 flex justify-between ">
        {inviteForm && (
          <InviteUserToTripForm
            trip={inviteForm}
            closeInviteForm={closeInviteForm}
          />
        )}
      </div>
      <div className="w-full">
        {adding_images && selectedTripUploadImage && (
          <ImageUploadModal tripId={selectedTripUploadImage} />
        )}

        {
          //EDIT TRIP MODAL
          editTrip && editTripModal(editedTrip || trips[0])
        }
      </div>
      <SideTab />
      <div className="w-full flex flex-wrap flex-row ">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className=" relative w-full lg:w-1/2 flex flex-col justify-start  shadow-md rounded p-4"
          >
            <div className="w-full border-1 dark:border-white p-6 m-1 dark:bg-gray-800 bg-white h-full">
              <FaPencilAlt
                className={`  
                  absolute top-10 right-5 dark:text-neon-green
                text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out`}
                onClick={() => handleEditTrip(trip)}
                size={30}
              />
              <div
                className="w-full flex-row flex justify-around"
                title="View Trip"
              >
                <Link href={`/trip/${trip.id}`} passHref>
                  <h2 className="text-xl font-bold cursor-pointer hover:text-blue-600 transition duration-300 ease-in-out dark:text-white">
                    {trip.name}
                  </h2>
                </Link>
              </div>
              {!trip.untimed_trips && (
                <p className="font-bold text-center dark:text-white">
                  {trip.start_date} - {trip.end_date}
                </p>
              )}
              <p className="text-gray-600 mt-1 mb-4 dark:text-gray-400">
                {trip.description}
              </p>
              <ScrollableImageBar trip_id={trip.id} />

              <div className="flex justify-between mt-auto space-x-2 flex-row w-full justify-between">
                <FaUserPlus
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out dark:text-neon-pink"
                  onClick={() => setInviteForm(trip)}
                  size={20}
                  title="Invite User"
                />
                <div
                  className="flex-row flex flex-wrap hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out"
                  onClick={() => handleAddImagesClick(trip.id)}
                  title="Add Images"
                >
                  <FaPlus className=" text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out mr-2 dark:text-neon-blue" />
                  <FaImage className=" text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out dark:text-neon-blue" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type scrollableImageBarProps = {
  trip_id: string;
};

const ScrollableImageBar: React.FC<scrollableImageBarProps> = ({ trip_id }) => {
  const {
    data: images,
    status: imagesStatus,
    error: imagesError,
  } = useQueryTripImages(trip_id);

  if (imagesStatus === 'pending') {
    return <p>Loading...</p>;
  }

  if (imagesStatus === 'error') {
    return <p>Error loading images</p>;
  }

  if (!images) {
    return <p className="dark:text-white">No images found</p>;
  }

  return (
    <div className="overflow-x-scroll flex space-x-2 w-26 h-26 mb-4 scrollbar-class">
      {images.length > 0 ? (
        images.map((image, idx) => (
          <div
            key={idx}
            className="w-24 h-24 flex-shrink-0 relative dark:text-white"
          >
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`${image.name}`}
              layout="fill"
              objectFit="cover"
              className="rounded"
              sizes="128px"
            />
          </div>
        ))
      ) : (
        <p className="dark:text-white">No images found</p>
      )}
    </div>
  );
};
