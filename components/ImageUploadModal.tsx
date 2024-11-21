import React, { useEffect, useMemo, useState } from 'react';
import {
  tripViewStore,
  useTripViewStore,
  useAddImage,
  useGetUploadProgress,
} from './Trip_View/Trip_View_Image_Store';
import { Trip } from '@/definitions/Trip_View';
import { FaTimes } from 'react-icons/fa';

type ImageUploadModalProps = {
  tripId: string;
};

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ tripId }) => {
  const addImage = useAddImage();

  const { adding_images } = useTripViewStore();

  const handleSubmitImages = async (e: React.FormEvent<HTMLFormElement>) => {
    //when done ... set adding_images to false
    const formData = new FormData(e.currentTarget);

    const id = tripId;

    if (!id) {
      return;
    }

    try {
      console.log('Start Add Image');
      await addImage.mutateAsync({ formData, id });

      console.log('End Add Image');
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

  const onClose = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        adding_images: false,
      };
    });
  };

  const [imageUploadState, setImageUploadState] = useState<
    'uploading' | 'error' | 'success' | 'none'
  >('none');

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //check if already uploading
    if (imageUploadState === 'uploading') {
      return;
    }

    setImageUploadState('uploading');
    e.preventDefault();
    await handleSubmitImages(e);
    setImageUploadState('success');
  };

  const [totalSize, setTotalSize] = useState(0);
  const maxSize = 1000 * 1024 * 1024; // 1000 MB in bytes

  const handleFileChange = (event: { target: { files: any } }) => {
    const files = event.target.files;
    let size = 0;
    for (let i = 0; i < files.length; i++) {
      size += files[i].size;
    }
    setTotalSize(size);
  };

  const {
    data: upload_progress,
    status: upload_progress_status,
    error: upload_progress_error,
  } = useGetUploadProgress();

  useEffect(() => {
    console.log('Upload Progress:', upload_progress);
  }, [upload_progress]);

  const progress_percenta = useMemo(() => {
    const megabytes_completed =
      (upload_progress?.progress || 0) / (1024 * 1024);
    const megabytes_total = totalSize / (1024 * 1024);
    return Math.floor((megabytes_completed / megabytes_total) * 100);
  }, [upload_progress, totalSize]);

  if (!adding_images) {
    return null;
  }

  return (
    <div className="modal-overlay dark:bg-black " onClick={onClose}>
      <div
        className="modal-content dark:bg-black dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dark:text-white">Upload Images</h2>
        <FaTimes
          className="absolute top-5 right-5 hover:text-red-500 cursor-pointer"
          onClick={onClose}
          size={30}
          title="Cancel Add Images"
        />
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="description">Descriptions:</label>
            <textarea
              id="description"
              className="dark:bg-gray-800 dark:text-white"
              name="description"
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
          {/* Upload progress */}
          {/* print the number of value*/}
          {
            <div className="progress-bar">
              <h1> {totalSize > 0 ? progress_percenta : 0}% Uploaded</h1>

              <div
                className="progress-bar-fill bg-green-500"
                style={{ width: `${upload_progress?.progress}%` }}
              ></div>
            </div>
          }
          {
            <div>
              <h1>
                {' '}
                {Math.floor(
                  (upload_progress?.progress || 0) / (1024 * 1024)
                )}{' '}
                MB / {Math.floor(totalSize / (1024 * 1024))} MB
              </h1>
            </div>
          }
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;
