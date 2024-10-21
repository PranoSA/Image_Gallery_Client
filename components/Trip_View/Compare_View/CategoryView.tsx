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

import { FaArchway, FaChevronUp, FaFolder } from 'react-icons/fa';

import { Image } from '@/definitions/Trip_View';
import React from 'react';
import NextImage from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { Banner_Component } from '../Banner_Component';
import { useCompareViewStore, CompareViewStore } from './CompareStore';

// discard/pass image icon (not trash, like a arrow pointing up and down)
import { FaArrowAltCircleDown } from 'react-icons/fa';

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
    const api_url = `${process.env.NEXT_PUBLIC_IMAGE_API_URL}/trip/${trip_id}/images/`;

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

        <Banner_Component />
        <div className="flex flex-wrap w-full flex-row">
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
        {images_for_day_and_unassigned.length == 0 && (
          <div className="flex justify-center items-center w-full h-96">
            <h1 className="text-2xl text-gray-500">No images for date</h1>
          </div>
        )}
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

  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const id = useContext(TripContext).id;

  const editImage = UpdateImage();

  const {
    data: trip,
    isLoading: tripIsLoading,
    isError: tripIsError,
  } = useQueryTrip(id);

  const removeImageFromCategory = async (image: Image) => {
    const new_image = {
      ...image,
      category: '',
    };
    if (!trip) return;
    //update the image
    const res = await editImage.mutate({
      image: new_image,
      trip,
    });

    //set the local images
  };

  const OpenFolder = () => {
    return (
      <div
        className="w-full grow-1 flex-grow flex flex-wrap flex-row items-center p-4 bg-white shadow-md rounded-lg border-1 order-yellow-500"
        ref={dropRef}
      >
        <div className="w-full flex flex-row ">
          <FaFolder className="text-6xl text-yellow-500 mr-2" />
          <FaChevronUp
            className="text-2xl cursor-pointer"
            onClick={() => setOpen(null)}
          />
          <h2 className="text-xl ml-5 font-semibold">{folder.name}</h2>
        </div>
        {/* Mow -> The Open Folder Contains List of images*/}
        <div className="w-full flex flex-row">
          <div className="w-1/4 w-min-[150px] flex flex-wrap flex-row items-top items-start">
            <div className="w-full flex flex-col items-left">
              {images.map((image) => (
                <div
                  onClick={() => {
                    if (selectedImage === image) {
                      setSelectedImage(null);
                    } else {
                      setSelectedImage(image);
                    }
                  }}
                  key={image.id}
                  className="flex w-full justify-between items-center border rounded p-2"
                >
                  <h3 className="text-black font-bold h-12">{image.name}</h3>
                  <div className="flex-shrink-0">
                    <ImageItemClosed image={image} onDragEnd={onDragEnd} />
                  </div>
                  <div>
                    <FaArrowAltCircleDown
                      onClick={() => removeImageFromCategory(image)}
                      className="text-2xl cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Image Preview Taking Up Rest of the Space */}
          <div className="relative w-3/5 flex flex-wrap flex-row min-h-[400px]">
            {selectedImage && (
              <div className="w-full h-full">
                <NextImage
                  src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${selectedImage.file_path}`}
                  alt={`Image for ${selectedImage.created_at}`}
                  layout="fill"
                  objectFit="contain"
                  sizes="(max-width: 500px) 100vw, 500px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (opened) {
    return <OpenFolder />;
  }

  return (
    <div
      className="w-1/3 grow-1 flex-grow flex flex-wrap flex-row items-center p-4 bg-white shadow-md rounded-lg border-1 order-yellow-500"
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
      <h2 className="text-xl ml-5 font-semibold">{folder.name}</h2>
      {!opened ? (
        //return the "stack" of images that compresses them
        <>
          <div className="relative w-full flex flex-wrap flex-row">
            <h2> Images : {images.length}</h2>
          </div>
        </>
      ) : (
        //return list of images that makes each one accessible
        <div className="relative w-full flex flex-wrap flex-row">
          {images.map((image) => (
            <div
              key={image.id}
              className="flex relative w-1/4 min-w-[180px] h-[160px]  justify-center align-center items-center border rounded bg-yellow-100 "
            >
              <ImageItem key={image.id} image={image} onDragEnd={onDragEnd} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ImageItemClosed = ({
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
      className={` relative p-2 border rounded w-full  h-[64px]${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <NextImage
        src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
        alt={`Image for ${image.created_at}`}
        layout="fill"
        objectFit="contain"
        sizes="64px"
      />
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
        sizes="128px"
      />
    </div>
  );
};

export default CategoryView;
