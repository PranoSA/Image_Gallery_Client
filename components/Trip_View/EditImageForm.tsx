import CoordinateForm from '@/components/CoordinateForm';
import {
  FaChevronLeft,
  FaChevronCircleDown,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
} from 'react-icons/fa';

import { useTripViewStore, tripViewStore } from './Trip_View_Image_Store';

import { useEffect, useState } from 'react';
import { FC } from 'react';

const EditImageForm: FC = () => {
  //Every time editedImage changed, update this state
  // this ammounts to a reselection of the image
  const [editedImage, setEditedImage] = useState<Image | null>(null);

  const { editingImage } = useTripViewStore();

  useEffect(() => {
    setEditedImage(editingImage);
  }, [editingImage]);

  const submitEditedImage = async () => {
    if (!editedImage) return;

    try {
      //use the update image mutation
      //UpdateImage().mutate(editedImage, trip?.id || '');

      //@ts-ignore
      UpdateImage(editedImage, trip?.id || '');

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

    //This will splitting the created_at and changing the date and joining the time back
    const [date, time] = e.target.value.split('T');

    const new_created_at = `${date}T${editedImage.created_at.split('T')[1]}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Time of the Edited Image
    if (!editedImage) return;

    //This will splitting the created_at and changing the time and joining the date back
    const [date, time] = editedImage.created_at.split('T');

    const new_time = e.target.value;

    const new_created_at = `${
      editedImage.created_at.split('T')[0]
    }T${new_time}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitEditedImage();
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
            <label className="block text-gray-700">Description:</label>
            <input
              type="text"
              name="description"
              value={editedImage?.description || ''}
              onChange={handleEditedImageChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Created At:</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={editedImage?.created_at.split('T')[0]}
                onChange={handleDateChange}
                className="w-1/2 px-3 py-2 border rounded-lg"
              />
              <input
                type="time"
                value={
                  editedImage?.created_at
                    .split('T')[1]
                    .split('+')[0]
                    .split('-')[0]
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
            onClick={submitEditedImage}
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
