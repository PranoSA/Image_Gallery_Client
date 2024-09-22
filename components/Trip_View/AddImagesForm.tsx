import '@/globals.css';

import {
  useTripViewStore,
  tripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';

import { useContext } from 'react';

import axios from 'axios';
import TripContext from '../TripContext';

export default function AddImagesForm() {
  const { id } = useContext(TripContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //when done ... set adding_images to false
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_images: false,
      };
    });
  };

  const handleSubmit2 = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    }
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
            <button onClick={closeModal} className="close-modal-button">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
