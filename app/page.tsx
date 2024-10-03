'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import InviteUserToTripForm from '@/components/Home_View/InviteUserToTripForm';

// get server session

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTrip, setNewTrip] = useState({
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

  //id of trip to invite user to
  // if null, then no form is shown
  const [inviteForm, setInviteForm] = useState<string | null>(null);

  const closeInviteForm = () => {
    setInviteForm(null);
  };

  //login status
  const { data: session, status } = useSession();

  const token = session?.accessToken;
  console.log('token is', token);

  useEffect(() => {
    //get access token from session
    const accessToken = session?.accessToken;
    console.log('WHOAMI', accessToken);

    // fetch http://localhost:5000/whoami
    const fetchWhoAmI = async () => {
      return;
      try {
        const response = await axios.get(`http://localhost:5000/whoami`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('whoami response', response);
      } catch (error) {
        console.error('Error fetching whoami:', error);
      }
    };

    if (accessToken) {
      fetchWhoAmI();
    }
  }, [session]);

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
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/trips/${editedTrip?.id}`,
        editedTrip
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
            <label className="block text-sm font-bold mb-2" htmlFor="end_date">
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
    );
  };

  useEffect(() => {
    const fetchTrips = async () => {
      //if no access token, return
      if (!session) {
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/trips`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
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
      setTrips(response.data);
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };
  //get access token from session
  const accessToken = session?.accessToken;
  console.log('access token is', accessToken);

  //if not logged in - redirect to keycloak login page

  //if not logged in, redirect to login page
  if (!session) {
    return <button onClick={() => signIn('keycloak')}>Sign In </button>;
  }

  // show invite modal if inviteForm is not null
  if (inviteForm) {
    return (
      <InviteUserToTripForm
        tripId={inviteForm}
        closeInviteForm={closeInviteForm}
      />
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {
        //EDIT TRIP MODAL
        editTrip && editTripModal(editedTrip || trips[0])
      }

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          Add New Trip
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold">{trip.name}</h2>
            <p>{trip.description}</p>
            <p>
              {trip.start_date} - {trip.end_date}
            </p>

            <div className="flex justify-between mt-4">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={(e) => handleEditTrip(trip)}
              >
                Edit
              </button>
              <Link href={`/trip/${trip.id}`}>Visit</Link>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setInviteForm(trip.id)}
              >
                Invite
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
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
