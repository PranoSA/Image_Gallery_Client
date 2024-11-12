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
import ImagePreview from '../ImagePreview';

//check mark icon
import { FaCheck } from 'react-icons/fa';
import PlainViewTimed from '@/components/Trip_View/Compare_View/Untimed_Compare_View/Plain_View_Timed';
import ConfirmDeletionModal from '../ConfirmDeletionModal';

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
    viewed_image_index,
    editingImage,
  } = useTripViewStore();

  //listen to selected images and change images to delete
  //when component is unmounted, clear selected images
  useEffect(() => {
    //
    const new_images_to_delete = selected_images;

    tripViewStore.setState((state) => {
      return {
        ...state,
        images_to_delete: new_images_to_delete,
      };
    });
  }, [selected_images]);

  //reset when unmounted
  useEffect(() => {
    return () => {
      tripViewStore.setState((state) => {
        return {
          ...state,
          selected_images: [],
          images_to_delete: [],
        };
      });
    };
  }, []);

  //if number of selected images is 0, then set to select
  useEffect(() => {
    if (selected_images.length === 0) {
      setSelectionOrCompare('Select');
    }
  }, [selected_images]);

  const handleCompareClick = () => {
    if (selected_images.length === 0) return;
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

  console.log('Viewed Image Index: ', viewed_image_index);
  console.log('Preview Image: ', [viewed_image_index]);

  const setPreviewImage = (image: Image) => {
    if (!images) return;
    tripViewStore.setState((state) => {
      return {
        ...state,
        viewed_image_index: selected_images.findIndex(
          (img) => img.id === image.id
        ),
      };
    });
  };

  if (selectionOrCompare === 'Select') {
    return (
      <div className="flex flex-col items-center ">
        <ConfirmDeletionModal />
        <div className="flex flex-row space-x-4 p-2">
          <button
            onClick={handleCompareClick}
            className={`px-4 py-2 font-bold rounded-lg shadow-md ${
              selected_images.length === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-700'
            }`}
            disabled={selected_images.length === 0}
          >
            Compare
          </button>

          {/* Button to open the delete modal */}
          <button
            onClick={() => {
              console.log('SSD|SDSD CLICKEd');
              tripViewStore.setState((state) => {
                return {
                  ...state,
                  confirm_deletion: true,
                };
              });
            }}
            className={`px-4 py-2 font-bold rounded-lg shadow-md ${
              selected_images.length === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-700'
            }`}
            disabled={selected_images.length === 0}
          >
            Delete
          </button>
        </div>

        <PlainViewTimed show_selection={true} />
      </div>
    );
  }
  if (selectionOrCompare === 'Compare') {
    return (
      <div className="flex flex-col items-center space-y-4">
        {viewed_image_index !== null && (
          <ImagePreview
            preset_images={{
              images: selected_images || [],
              preset: true,
            }}
          />
        )}
        {editingImage && <EditImageModal />}
        <button
          onClick={() => setSelectionOrCompare('Select')}
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-700 "
        >
          Finish Comparing
        </button>
        <div className="flex flex-row w-full flex-wrap ">
          {selected_images.map((image, index) => (
            <div
              key={index}
              className="relative w-1/2  flex items-center justify-end bg-grey  mt-20 min-h-[550px]"
            >
              <div className="absolute top-1 right-1 flex z-5000">
                <AiFillDelete
                  onClick={() => deleteImage(image)}
                  className="cursor-pointer z-50"
                  size={24}
                  style={{ marginRight: '10px' }}
                />
                <HiOutlinePencil
                  onClick={() => setEditingImage(image)}
                  className="cursor-pointer z-50"
                  size={24}
                  style={{ marginRight: '10px' }}
                />
                <HiEye
                  onClick={() => setPreviewImage(image)}
                  className="cursor-pointer z-50"
                  size={24}
                />
                <FaCheck
                  className="cursor-pointer z-50 ml-3 text-black hover:text-black hover:scale-110 transition-transform"
                  onClick={() => {
                    //remove from selected images
                    tripViewStore.setState((state) => {
                      return {
                        ...state,
                        selected_images: state.selected_images.filter(
                          (img) => img.id !== image.id
                        ),
                      };
                    });
                  }}
                  size={24}
                ></FaCheck>
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
              <div
                key={index}
                className="mt-10 relative min-w-[500px] flex bg-grey max-h-[500px] min-h-[500px]"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default SelectAndCompare;
