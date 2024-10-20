'use client';

import '@/globals.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import InviteUserToTripForm from '@/components/Home_View/InviteUserToTripForm';
import IntroPage from '@/components/Home_View/IntroPage';
import NextImage from 'next/image';

import './page.css';

//import query provider
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import { useAddImage } from '@/components/Trip_View/Trip_View_Image_Store';
import AddImagesForm from '../components/Trip_View/AddImagesForm';
import { Category, Image, Trip } from '@/definitions/Trip_View';
import { useFetchMyTrips } from '@/components/Trip_View/Trip_View_Image_Store';
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
};

function Home() {
  const [newTrip, setNewTrip] = useState<TripSubmitState>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    categories: [],
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

  const closeInviteForm = () => {
    setInviteForm(null);
  };

  //login status
  const { data: session, status } = useSession();

  const [selectedTripUploadImage, setSelectedTripUploadImage] = useState<
    string | null
  >(null);

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

  return (
    <div className="flex flex-wrap flex-row justify-around ">
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
        <h1 className="text-2xl font-bold text-center">My Trips</h1>
      </div>
      <div
        className="z-10 w-full flex items-center justify-center font-mono text-sm p-5"
        onClick={() => setShowForm(true)}
      >
        <FaPlus className="text-black hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out" />
        <p className="font-black  font-bold text-lg hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out m-5">
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

type ImageUploadModalProps = {
  tripId: string;
  onClose: () => void;
  handleSubmitImages: (e: React.FormEvent<HTMLFormElement>) => void;
};

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  tripId,
  onClose,
  handleSubmitImages,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [editTrip, setEditTrip] = useState<boolean>(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
  const [editTripError, setEditTripError] = useState<string | null>(null);

  //id of trip to invite user to
  // if null, then no form is shown
  const [inviteForm, setInviteForm] = useState<string | null>(null);

  const [imageUploadState, setImageUploadState] = useState<
    'uploading' | 'error' | 'success' | 'none'
  >('none');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setImageUploadState('uploading');
    e.preventDefault();
    handleSubmitImages(e);
  };

  const [totalSize, setTotalSize] = useState(0);
  const maxSize = 100 * 1024 * 1024; // 100 MB in bytes

  const handleFileChange = (event: { target: { files: any } }) => {
    const files = event.target.files;
    let size = 0;
    for (let i = 0; i < files.length; i++) {
      size += files[i].size;
    }
    setTotalSize(size);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Images</h2>
        <FaTimes
          className="absolute top-5 right-5"
          onClick={onClose}
          size={30}
          title="Cancel Add Images"
        />
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="images">Images:</label>
            <input
              type="file"
              id="image"
              name="image"
              multiple
              accept="image/*"
              required
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            className={`submit-button ${
              totalSize > maxSize
                ? 'bg-red-500 cursor-not-allowed'
                : 'bg-blue-500'
            }`}
            disabled={totalSize > maxSize}
          >
            Upload
          </button>
          <div className="file-size-info">
            <p>Total size: {(totalSize / (1024 * 1024)).toFixed(2)} MB</p>
            {totalSize > maxSize && (
              <p className="text-red-500">Total size exceeds 100 MB limit!</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const TripListCompontent = () => {
  //you don't need authetnication context - it will be conditionally rendered

  const { data: trips, status, error } = useFetchMyTrips();

  // when done loading, load the images

  const [editTrip, setEditTrip] = useState<boolean>(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
  const [editTripError, setEditTripError] = useState<string | null>(null);

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
        <div className="z-60 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
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
  };

  if (!trips) {
    return null;
  }
  const handleSubmitImages = async (e: React.FormEvent<HTMLFormElement>) => {
    //when done ... set adding_images to false
    const formData = new FormData(e.currentTarget);

    const id = selectedTripUploadImage;

    if (!id) {
      return;
    }

    try {
      const image = await addImage.mutate({ formData, id });

      //add
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    }

    setSelectedTripUploadImage(null);
  };

  const closeInviteForm = () => {
    setInviteForm(null);
  };

  //check errors for fetching trips
  if (status === 'error') {
    return <p>Error loading trips</p>;
  }

  return (
    <div className=" flex flex-wrap w-full   p-5">
      <div className="w-full z-100 flex justify-between ">
        {inviteForm && (
          <InviteUserToTripForm
            trip={inviteForm}
            closeInviteForm={closeInviteForm}
          />
        )}
      </div>
      <div className="w-full">
        {selectedTripUploadImage && (
          <ImageUploadModal
            tripId={selectedTripUploadImage}
            onClose={() => setSelectedTripUploadImage(null)}
            handleSubmitImages={handleSubmitImages}
          />
        )}

        {
          //EDIT TRIP MODAL
          editTrip && editTripModal(editedTrip || trips[0])
        }
      </div>
      <div className="w-full flex flex-wrap flex-row">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className=" relative w-full lg:w-1/2 flex flex-col justify-start bg-white shadow-md rounded p-4"
          >
            <FaPencilAlt
              className={`  
                  absolute top-5 right-5
                text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out`}
              onClick={() => handleEditTrip(trip)}
            />
            <div className="w-full flex-row flex justify-around">
              <Link href={`/trip/${trip.id}`} passHref>
                <h2 className="text-xl font-bold cursor-pointer hover:text-blue-600 transition duration-300 ease-in-out">
                  {trip.name}
                </h2>
              </Link>
            </div>
            <p className="font-bold text-center">
              {trip.start_date} - {trip.end_date}
            </p>
            <p className="text-gray-600 mt-1 mb-4">{trip.description}</p>
            <ScrollableImageBar trip_id={trip.id} />

            <div className="flex justify-between mt-auto space-x-2 flex-row w-full justify-between">
              <FaUserPlus
                className="text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out"
                onClick={() => setInviteForm(trip)}
                size={20}
                title="Invite User"
              />
              <div
                className="flex-row flex flex-wrap hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out"
                onClick={() => handleAddImagesClick(trip.id)}
                title="Add Images"
              >
                <FaPlus className=" text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out mr-2" />
                <FaImage className=" text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out" />
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
    return <p>No images found</p>;
  }

  return (
    <div className="overflow-x-scroll flex space-x-2 mb-4 scrollbar-class">
      {images.map((image, idx) => (
        <div key={idx} className="w-24 h-24 flex-shrink-0 relative">
          <NextImage
            src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
            alt={`${image.name}`}
            layout="fill"
            objectFit="cover"
            className="rounded"
          />
        </div>
      ))}
    </div>
  );
};
