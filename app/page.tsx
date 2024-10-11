'use client';

import '@/globals.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import InviteUserToTripForm from '@/components/Home_View/InviteUserToTripForm';
import IntroPage from '@/components/Home_View/IntroPage';
import NextImage from 'next/image';

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

//add person icon for inviting users
import { FaUserPlus } from 'react-icons/fa';

//icon for adding images
import { FaPlus } from 'react-icons/fa';
//image upload icon
import { FaImage } from 'react-icons/fa';

// get server session

const queryClient = new QueryClient();

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

  const [editTrip, setEditTrip] = useState<boolean>(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);
  const [editTripError, setEditTripError] = useState<string | null>(null);

  useEffect(() => {
    console.log('New Categories', newTrip.categories);
  }, [newTrip]);

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

  const addImage = useAddImage();

  const token = session?.accessToken;

  const [selectedTripUploadImage, setSelectedTripUploadImage] = useState<
    string | null
  >(null);

  useEffect(() => {
    //set local storage bearer token
    if (session) {
      localStorage.setItem('accessToken', session.accessToken as string);
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
          Authorization: `Bearer ${session?.accessToken}`,
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
    return <IntroPage />;
  }

  // show invite modal if inviteForm is not null

  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      {inviteForm && (
        <InviteUserToTripForm
          trip={inviteForm}
          closeInviteForm={closeInviteForm}
        />
      )}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          Add New Trip
        </button>
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
    </main>
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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmitImages(e);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Images</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />
          </div>
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
            />
          </div>
          <button type="submit" className="submit-button">
            Upload
          </button>
        </form>
        <button onClick={onClose} className="close-modal-button">
          Close
        </button>
      </div>
    </div>
  );
};

const TripListCompontent = () => {
  //you don't need authetnication context - it will be conditionally rendered

  const { data: trips, status, error } = useFetchMyTrips();

  console.log('Trips:', trips);
  console.log('Status:', status);
  console.log('Error:', error);

  // when done loading, load the images

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [showForm, setShowForm] = useState(false);

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
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <div className="w-full z-100 flex justify-between border-4 border-blue-500">
        {inviteForm && (
          <InviteUserToTripForm
            trip={inviteForm}
            closeInviteForm={closeInviteForm}
          />
        )}
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="flex flex-col justify-between bg-white shadow-md rounded p-4"
          >
            <div className="w-full flex-row flex justify-around">
              <Link href={`/trip/${trip.id}`} passHref>
                <h2 className="text-xl font-bold cursor-pointer hover:text-blue-600 transition duration-300 ease-in-out">
                  {trip.name}
                </h2>
              </Link>
              <FaPencilAlt
                className="text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out"
                onClick={() => handleEditTrip(trip)}
              />
            </div>
            <p className="font-bold text-center">
              {trip.start_date} - {trip.end_date}
            </p>
            <p className="text-gray-600">{trip.description}</p>
            <ScrollableImageBar trip_id={trip.id} />

            <div className="flex justify-between mt-auto space-x-2 flex-row w-full justify-between">
              <FaUserPlus
                className="text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out"
                onClick={() => setInviteForm(trip)}
                size={20}
              />
              <div
                className="flex-row flex flex-wrap"
                onClick={() => handleAddImagesClick(trip.id)}
              >
                <FaPlus className=" text-gray-500 hover:text-gray-700 cursor-pointer transition duration-300 ease-in-out" />
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
    <div className="overflow-x-scroll flex space-x-2 mb-4">
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
