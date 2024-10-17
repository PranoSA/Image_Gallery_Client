import '@/globals.css';

import {
  useTripViewStore,
  tripViewStore,
  useAddImage,
  useQueryTripImages,
} from '@/components/Trip_View/Trip_View_Image_Store';

import { useContext } from 'react';

import TripContext from '../TripContext';
import React from 'react';

import { FaTimes } from 'react-icons/fa';

export default function AddImagesForm() {
  const { id } = useContext(TripContext);

  const addImage = useAddImage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //when done ... set adding_images to false

    const formData = new FormData(e.currentTarget);

    try {
      const image = await addImage.mutate({ formData, id });

      //add
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    }

    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_images: false,
      };
    });
  };

  const closeModal = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_images: false,
      };
    });
  };

  const { adding_images } = useTripViewStore();

  return (
    <>
      {adding_images && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <FaTimes
              className="absolute top-5 right-5"
              onClick={closeModal}
              size={30}
              title="Cancel Add Images"
            />

            <h2>Upload Images</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  required
                ></textarea>
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
          </div>
        </div>
      )}
    </>
  );
}
