import CoordinateForm from '@/components/CoordinateForm';
import {
  FaChevronLeft,
  FaChevronCircleDown,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
} from 'react-icons/fa';

import {
  useTripViewStore,
  tripViewStore,
  UpdateImage,
  useQueryTrip,
} from './Trip_View_Image_Store';

import { useEffect, useState, useContext } from 'react';
import { FC } from 'react';

import TripContext from '../TripContext';

import { Image } from '@/definitions/Trip_View';

const EditImageForm: FC = () => {
  //Every time editedImage changed, update this state
  // this ammounts to a reselection of the image
  const [editedImage, setEditedImage] = useState<Image | null>(null);

  const id = useContext(TripContext).id;

  const { editingImage } = useTripViewStore();

  //const { data: trip, isLoading, isError } = useQueryTrip(id);

  const { data: trip, isLoading, isError } = useQueryTrip(id);

  const updateImage = UpdateImage();

  useEffect(() => {
    setEditedImage(editingImage);
  }, [editingImage]);

  const submitEditedImage = async () => {
    if (!editedImage) return;

    try {
      //use the update image mutation
      //UpdateImage().mutate(editedImage, trip?.id || '');

      //UpdateImage(editedImage, trip?.id || '');
      /*await UpdateImage().mutate({
        image: editedImage,
        trip: trip,
      });*/

      if (!trip) return;

      await updateImage.mutate({ image: editedImage, trip: trip });

      //setEditingImage(null)
      tripViewStore.setState((state) => {
        return {
          ...state,
          editingImage: null,
        };
      });

      setEditedImage(null);
    } catch (err) {
      console.error('Error editing image:', err);
    }
  };

  const handleEditedImageChange = (e: any) => {
    const field = e.target.name;

    const value = e.target.value;

    if (!editedImage) return;

    setEditedImage({
      ...editedImage,
      [field]: value,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Date of the Edited Image
    if (!editedImage) return;

    // get the yyyy-mm-dd part of the date
    const date = e.target.value;
    const [year, month, day] = date.split('-').map(Number);

    //const new_created_at = `${date}T${editedImage.created_at.split('T')[1]}`;
    const new_created_at = editedImage.created_at;
    new_created_at.setFullYear(year);
    new_created_at.setMonth(month - 1);
    new_created_at.setDate(day);

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedImage) return;

    const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
    const newDate = new Date(editedImage.created_at);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);

    setEditedImage({
      ...editedImage,
      created_at: newDate,
    });
  };
  const cancelEditImage = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        editingImage: null,
      };
    });
  };

  if (!editedImage) return null;

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  <input
    type="date"
    value={editedImage?.created_at ? formatDate(editedImage.created_at) : ''}
    onChange={handleDateChange}
    className="w-1/2 px-3 py-2 border rounded-lg"
  />;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-h-[80vh] max-w-lg overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            //submitEditedImage();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700">Description:</label>
            <input
              type="text"
              name="description"
              value={editedImage?.description || ''}
              onChange={handleEditedImageChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Add created_at,  */}
          <div className="mb-4">
            <label className="block text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={editedImage?.name || ''}
              onChange={handleEditedImageChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Date:</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={
                  editedImage?.created_at
                    ? formatDate(editedImage.created_at)
                    : ''
                }
                onChange={handleDateChange}
                className="w-1/2 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Created At:</label>
            <div className="flex space-x-2">
              <input
                type="time"
                value={
                  editedImage?.created_at
                    ? formatTime(editedImage.created_at)
                    : ''
                }
                onChange={handleTimeChange}
                className="w-1/2 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          {/* Use The Coordinate Form Component */}
          <CoordinateForm
            editedImage={editedImage}
            setEditedImage={setEditedImage}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => submitEditedImage()}
          >
            Save
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => cancelEditImage()}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditImageForm;
