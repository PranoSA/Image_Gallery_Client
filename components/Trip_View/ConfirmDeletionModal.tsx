/**
 *
 * With ConfirmDeletionModal, the user can confirm the deletion of images
 *
 * This can be one or multiple images
 *
 */

import React from 'react';

import NextImage from 'next/image';

import { tripViewStore, useTripViewStore } from './Trip_View_Image_Store';
import { Image } from '@/definitions/Trip_View';

import { UpdateImage, useDeleteImage } from './Trip_View_Image_Store';

const ConfirmDeletionModal: React.FC = () => {
  const { confirm_deletion, images_to_delete } = useTripViewStore();

  const editImage = UpdateImage();

  const deleteImage = useDeleteImage();

  const onCancel = () => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        confirm_deletion: false,
        images_to_delete: [],
      };
    });
  };

  const confirmDeletion = async () => {
    //promis all -> parallel the deletions async
    const promises = images_to_delete.map((image) =>
      deleteImage.mutateAsync(image)
    );
    const results = await Promise.all(promises);

    //if all deletions are successful, close the modal
    if (results.every((result) => result)) {
      onCancel();
    }
  };

  if (!confirm_deletion) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Confirm Deletion
        </h2>
        <p className="mb-4 dark:text-gray-300">
          Are you sure you want to delete the following images?
          <ol>
            {images_to_delete.map((image, index) => (
              <>
                <li key={index}>{image.name}</li>
                <div className="relative h-[100px] w-[100px]">
                  <NextImage
                    src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                    alt={image.name}
                    width={100}
                    height={100}
                    objectFit="fit"
                    className="rounded-lg"
                    //as small as possible for download speed
                  />
                </div>
              </>
            ))}
          </ol>
        </p>
        <ul className="mb-4 list-disc list-inside dark:text-gray-300">
          {images_to_delete.map((image, index) => (
            <li key={index}>{image.name}</li>
          ))}
        </ul>
        <div className="flex justify-end space-x-4">
          <button
            onClick={confirmDeletion}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletionModal;
