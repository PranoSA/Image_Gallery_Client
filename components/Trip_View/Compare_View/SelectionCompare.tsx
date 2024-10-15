/**
 *
 * This component -> You have a main screen
 *
 * That looks exactly like the "Plain View"
 *
 * But you have two modes ['Select' and 'Compare']
 *
 *
 * In Select:
 * Except -> You selected a list of images [index][]
 * Essneitally, besides this showing the same as "Plain View"
 *
 *
 * In Compare:
 * It shows only the Selected Images
 *
 * When you press "finish" it will go back to "SELECT"
 *
 * Then there is a "Clear" button that will clear the selected images
 *
 * When you delete an image -> Also delete from the selected images
 *
 *
 */
import { useState, useMemo, useEffect, useContext } from 'react';
import {
  tripViewStore,
  useQueryTrip,
  useTripViewStore,
  useDeleteImage,
  useQueryTripImages,
} from '../Trip_View_Image_Store';
import { Trip, Image } from '@/definitions/Trip_View';
import TripContext from '@/components/TripContext';
import PlainView from './Plain_View';
import NextImage from 'next/image';
import EditImageForm from '@/components/Trip_View/EditImageForm';

import { AiFillDelete } from 'react-icons/ai';
import { HiOutlinePencil, HiEye } from 'react-icons/hi';
import { FaDownload } from 'react-icons/fa';
import EditImageModal from '@/components/Trip_View/EditImageForm';

const SelectAndCompare = () => {
  const [selectionOrCompare, setSelectionOrCompare] = useState<
    'Select' | 'Compare'
  >('Select');

  const { id } = useContext(TripContext);

  const delete_image = useDeleteImage();

  const deleteImage = async (image: Image) => {
    await delete_image.mutate(image);
  };

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useQueryTrip(id);

  const {
    data: images,
    isLoading: imagesLoading,
    isError: imagesError,
  } = useQueryTripImages(id);

  const {
    selected_images,
    selected_date,
    selected_image_preview,
    editingImage,
  } = useTripViewStore();

  const handleCompareClick = () => {
    setSelectionOrCompare('Compare');
  };

  const setEditingImage = (image: Image) => {
    tripViewStore.setState((state) => {
      return {
        ...state,
        editingImage: image,
      };
    });
  };

  const setPreviewImage = (image: Image) => {
    if (!images) return;
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: images.findIndex((img) => img.id === image.id),
      };
    });
  };

  if (selectionOrCompare === 'Select') {
    return (
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleCompareClick}
          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-700"
        >
          Compare
        </button>
        <PlainView show_selection={true} />
      </div>
    );
  }
  if (selectionOrCompare === 'Compare') {
    return (
      <div className="flex flex-col items-center space-y-4">
        {editingImage && <EditImageModal />}
        <button
          onClick={() => setSelectionOrCompare('Select')}
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-700"
        >
          Finish Comparing
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selected_images.map((image, index) => (
            <div
              key={index}
              className="relative w-full h-full flex items-center justify-center max-w-full m-5 max-h-[500px]"
            >
              <NextImage
                src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                alt={`Image for ${image.created_at}`}
                layout="fill"
                className="object-contain rounded-lg"
                style={{
                  cursor: 'pointer',
                  margin: '10px',
                }}
              />
              <div className="absolute top-1 right-1 flex">
                <AiFillDelete
                  onClick={() => deleteImage(image)}
                  className="cursor-pointer"
                  size={24}
                  style={{ marginRight: '10px' }}
                />
                <HiOutlinePencil
                  onClick={() => setEditingImage(image)}
                  className="cursor-pointer"
                  size={24}
                  style={{ marginRight: '10px' }}
                />
                <HiEye
                  onClick={() => setPreviewImage(image)}
                  className="cursor-pointer"
                  size={24}
                />
                <FaDownload
                  onClick={async () => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}?download=true`
                    );
                  }}
                  className="cursor-pointer"
                  size={24}
                  style={{ marginLeft: '10px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default SelectAndCompare;
