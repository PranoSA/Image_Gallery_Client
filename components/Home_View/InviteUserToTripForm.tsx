/**
 *
 * Invite User to Trip Form
 *
 * Pass In Trip ID prop
 * Has Fields like email, permission[read-write, read-only, admin]
 *
 * Has a submit button
 * Has a cancel button
 *
 */

import React, { useEffect, useState } from 'react';

//icons
import { FaMailBulk, FaPlus, FaTimes } from 'react-icons/fa';

type InviteUserToTripFormProps = {
  tripId: string;
  closeInviteForm: () => void;
};

//use Session to get the access token
import { useSession, UseSessionOptions } from 'next-auth/react';

//create component
const InviteUserToTripForm: React.FC<InviteUserToTripFormProps> = ({
  tripId,
  closeInviteForm,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read-write');
  const [error, setError] = useState('');

  const opts: UseSessionOptions<any> = {
    required: true,
    onUnauthenticated: () => {
      //redirect to sign in page
      window.location.href = '/auth/signin';
    },
  };

  //get bearer from trip context
  const { data: session } = useSession(opts);

  //everything useSession is called, it returns an object with a key data

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/trips/${tripId}/invites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            email,
            permission,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to invite user');
      }

      setEmail('');
      setPermission('read-write');
      setError('');
      closeInviteForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      setError(message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Invite User to Trip</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Email
          </label>
          <div className="flex items-center border rounded px-3 py-2">
            <FaMailBulk className="text-gray-500 mr-2" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full outline-none"
              placeholder="Enter user's email"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="permission"
            className="block text-gray-700 font-bold mb-2"
          >
            Permission
          </label>
          <select
            id="permission"
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="read-write">Read-Write</option>
            <option value="read-only">Read-Only</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <FaPlus className="mr-2" />
            Invite
          </button>
          <button
            type="button"
            onClick={closeInviteForm}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteUserToTripForm;
