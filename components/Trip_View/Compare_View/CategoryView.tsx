import { useContext, useEffect, useMemo, useState } from 'react';
import AddCategoryForm from './AddCategoryModal';
import TripContext from '@/components/TripContext';
import {
  useQueryTrip,
  useTripViewStore,
  useQueryTripImages,
  useAddImage,
  UpdateImage,
} from '../Trip_View_Image_Store';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { FaChevronUp, FaFolder } from 'react-icons/fa';

import { Image } from '@/definitions/Trip_View';
import React from 'react';
import NextImage from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { Banner_Component } from '../Banner_Component';
import { useCompareViewStore, CompareViewStore } from './CompareStore';

const ItemTypes = {
  IMAGE: 'image',
};

const CategoryView = () => {
  const { id } = useContext(TripContext);
  const [localImages, setLocalImages] = useState<Image[]>([]);
  const {
    data: trip,
    isLoading: tripIsLoading,
    isError: tripIsError,
  } = useQueryTrip(id);

  const {
    data: images,
    isLoading: imagesIsLoading,
    isError: imagesIsError,
  } = useQueryTripImages(id);

  const [openCategoryFolder, setOpenCategoryFolder] = useState<string | null>(
    null
  );

  const { selected_date } = useTripViewStore();

  const { add_category_modal_open } = useCompareViewStore();

  const addImage = useAddImage();
  const editImage = UpdateImage();

  const imagesForDay = useMemo(() => {
    if (!images || !trip) return [];


    const date = new Date(trip?.start_date);
    date.setDate(date.getDate() + selected_date);
    //set offset
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

    return images.filter((image) => {
      const image_date = new Date(image.created_at);
      return image_date.toDateString() === date.toDateString();
    });
  }, [selected_date, images, trip]);

  const current_date: Date = useMemo(() => {
    if (!trip) return new Date();

    const start_date = new Date(trip?.start_date);
    start_date.setDate(start_date.getDate() + selected_date);
    start_date.setMinutes(
      start_date.getMinutes() + start_date.getTimezoneOffset()
    );

    return start_date;
  }, [selected_date, trip]);

  const categories_on_date = useMemo(() => {
    const categories = trip?.categories || [];

    return categories.filter((category) => {
      const start_date = new Date(category.start_date);
      const end_date = new Date(category.end_date);
      start_date.setMinutes(
        start_date.getMinutes() + start_date.getTimezoneOffset()
      );
      end_date.setMinutes(end_date.getMinutes() + end_date.getTimezoneOffset());

      return start_date <= current_date && current_date <= end_date;
    });
  }, [trip, current_date]);

  //now , using the categories_on_date, we can create the folders
  const folders = categories_on_date.map((category) => {
    return {
      name: category.category,
    };
  });

  const images_for_day_and_unassigned: Image[] = useMemo(() => {

    const imageUnassigned = (image: Image): boolean => {
      //make sure its in a category not '', and that the category actually exists
      return (
        !image.category ||
        image.category === '' ||
        image.category === null ||
        !folders.find((folder) => folder.name === image.category)
      );
    };

    return imagesForDay.filter(imageUnassigned);
  }, [imagesForDay, folders]);

  const handleDropImage = async (imageId: Image, folderName: string) => {
    //set the category of the image to the folder name
    //update the image
    //update the image store


    if (!trip) return;
    if (!images) return;

    const selected_image = images.find((img) => img.id === imageId.id);
    if (!selected_image) return;

    const new_image = {
      ...selected_image,
      category: folderName,
    };

    const res = await editImage.mutateAsync({
      image: new_image,
      trip,
    });

    //use mutation endpoint to update the image
    const edit_image =
      //update local images
      setLocalImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId.id ? { ...img, category: folderName } : img
        )
      );
  };

  const handleDragEnd = async (id: string) => {

    if (!images) return;
    //find that image with id and set the category to ''
    //create '' category for the image
    const image = images.find((img) => img.id === id);
    if (!image) return;
    if (!trip) return;

    //mutation now
    const new_image = {
      ...image,
      category: '',
    };



    //update the image
    const res = await editImage.mutate({
      image: new_image,
      trip,
    });



    setLocalImages((prevImages) =>
      prevImages.map((img) => (img.id === id ? { ...img, category: '' } : img))
    );
  };

  //save categorized images
  //save categorized images
  const saveCategorizedImages = (
    images: Image[],
    trip_id: string,
    old_images: Image[]
  ) => {
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/images/`;

    /// print all ima

    const filtered_images = images.filter((image) => {
      const old_image = old_images.find(
        (old_image) => old_image.id === image.id
      );

      //print image if category is not '' or undefined
      if (image.category && image.category !== '') {
      }

      //print old image if category is not '' or undefined
      if (old_image?.category && old_image.category !== '') {
      }

      //if old_image category is undefined and image category is not, then return true
      if (!old_image?.category && image.category) {
        return true;
      }

      return old_image?.category !== image.category;
    });

    //promise all to update all images
    const promises = filtered_images.map((image) => {
      return fetch(`${api_url}${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(image),
      });
    });

    // return Promise.all(promises)

    return Promise.all(promises);

    for (const image of images) {
      fetch(`${api_url}/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(image),
      })
        .then((res) => res.json())
        .catch((err) => console.error(err));
    }
  };

  const saveState = async () => {
    const trip_id = id;

    if (!images) return;

    try {
      const _ = await saveCategorizedImages(localImages, trip_id, images);

      //save the trip
      //const __ = await saveCategorizedTrip(localTrip as Trip);

      //if both work, set trip to local trip
      //and set images to local images
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-center space-x-4 w-full">
        {/* Button to add a category */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              CompareViewStore.setState((state) => {
                return {
                  ...state,
                  add_category_modal_open: true,
                };
              });
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Category
          </button>
        </div>
        {add_category_modal_open && <AddCategoryForm />}
      </div>
      <DndProvider backend={HTML5Backend}>
        {/* Buttons to Save (Calls saveImages and saveTrip)  - then sets local trip*/}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              saveState();
            }}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save State and Images
          </button>
        </div>

        <Banner_Component />
        <div className="grid grid-cols-3 gap-4">
          {folders.map((folder) => (
            <ImageDragFolder
              key={folder.name}
              folder={folder}
              images={(images || []).filter(
                (img) => img.category === folder.name
              )}
              onDropImage={handleDropImage}
              onDragEnd={handleDragEnd}
              opened={openCategoryFolder === folder.name}
              setOpen={(name: string | null) => setOpenCategoryFolder(name)}
            />
          ))}
        </div>

        <ImageGallery
          images={images_for_day_and_unassigned}
          onDragEnd={handleDragEnd}
        />
      </DndProvider>
    </div>
  );
};

const ImageGallery = ({
  images,
  onDragEnd,
}: {
  images: Image[];
  onDragEnd: (id: string) => void;
}) => {
  return (
    <div className="grid grid-cols-6 gap-2">
      {images.map((image) => (
        <ImageItem key={image.id} image={image} onDragEnd={onDragEnd} />
      ))}
    </div>
  );
};

const ImageDragFolder = ({
  folder,
  images,
  onDropImage,
  onDragEnd,
  opened,
  setOpen,
}: {
  folder: { name: string };
  images: Image[];
  onDropImage: (item: Image, folderName: string) => void;
  onDragEnd: (id: string) => void;
  opened: boolean;
  setOpen: (folder_name: string | null) => void;
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    drop: (item: Image) => onDropImage(item, folder.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const dropRef = React.useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (
    <div
      className="w-full flex flex-wrap flex-row items-center p-4 bg-white shadow-md rounded-lg"
      ref={dropRef}
    >
      <FaFolder className="text-6xl text-yellow-500 mr-2" />
      {!opened ? (
        <FaChevronDown
          className="text-2xl cursor-pointer"
          onClick={() => setOpen(folder.name)}
        />
      ) : (
        <FaChevronUp
          className="text-2xl cursor-pointer"
          onClick={() => setOpen(null)}
        />
      )}
      <h2 className="text-xl w-full font-semibold">{folder.name}</h2>
      {!opened ? (
        //return the "stack" of images that compresses them
        <>
          <div className="relative w-full flex flex-wrap flex-row">
            {images.slice(0, 3).map((image, index) => (
              <div
                key={image.id}
                className="flex relative w-1/2 h-[160px]  justify-center align-center items-center border rounded bg-yellow-100 "
              >
                <ImageItem key={image.id} image={image} onDragEnd={onDragEnd} />
              </div>
            ))}
            {images.length > 3 && (
              <div className=" w-1/2  h-[128px]  flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-40">
                <span className="text-white text-lg font-bold">
                  +{images.length - 3}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        //return list of images that makes each one accessible
        <div className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <ImageItem key={image.id} image={image} onDragEnd={onDragEnd} />
          ))}
        </div>
      )}
    </div>
  );
};

const ImageItem = ({
  image,
  onDropImage,
  onDragEnd,
}: {
  image: Image;
  onDropImage?: (id: number, folderName: string) => void;
  onDragEnd: (id: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.IMAGE,
    item: { id: image.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        onDragEnd(item.id);
      }
    },
  }));

  const dragRef = React.useRef<HTMLDivElement>(null);
  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={` relative p-2 h-[128px] border rounded w-full ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <NextImage
        src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
        alt={`Image for ${image.created_at}`}
        className="h-[128px]"
        layout="fill"
        objectFit="contain"
      />
    </div>
  );
};

export default CategoryView;
