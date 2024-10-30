import { useContext, useEffect, useMemo, useState } from 'react';
import AddCategoryForm from '@/components/Trip_View/Compare_View/AddCategoryModal';
import TripContext from '@/components/TripContext';
import {
  useQueryTrip,
  useTripViewStore,
  useQueryTripImages,
  useAddImage,
  UpdateImage,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import '@/components/Trip_View/Compare_View/Untimed_Compare_View/CategoryView.css';

import {
  FaArchway,
  FaCaretDown,
  FaCaretUp,
  FaChevronUp,
  FaFolder,
  FaPen,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';

import { Image, Category } from '@/definitions/Trip_View';
import React from 'react';
import NextImage from 'next/image';
import { FaChevronDown } from 'react-icons/fa';
import { Banner_Component } from '@/components/Trip_View/Compare_View/Untimed_Compare_View/Banner_Component';
import {
  useCompareViewStore,
  CompareViewStore,
} from '@/components/Trip_View/Compare_View/CompareStore';

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

  const [dayByDay, setDayByDay] = useState(true);

  console.log('Selected Date images', images);

  const { add_category_modal_open, untimed_trips_selected_date } =
    useCompareViewStore();

  useEffect(() => {
    if (!images) return;

    //if the images start date is more than the untimed_trips_selected_date, then set the untimed_trips_selected_date to the start date

    const first_image_date = new Date(images[0].created_at);

    if (first_image_date > untimed_trips_selected_date) {
      CompareViewStore.setState((state) => {
        return {
          ...state,
          untimed_trips_selected_date: first_image_date,
        };
      });
    }
  }, [images, untimed_trips_selected_date]);

  const editImage = UpdateImage();

  const addImageToFolder = async (image: Image, folderName: string) => {
    const new_image = {
      ...image,
      category: folderName,
    };

    if (!trip) return;

    const res = await editImage.mutate({
      image: new_image,
      trip,
    });

    setLocalImages((prevImages) =>
      prevImages.map((img) =>
        img.id === image.id ? { ...img, category: folderName } : img
      )
    );
  };

  const imagesForDay = useMemo(() => {
    if (!images || !trip) return [];

    const offset_timezone = new Date().getTimezoneOffset();
    const date = untimed_trips_selected_date;
    //date.setMinutes(date.getMinutes() + offset_timezone);

    return images.filter((image) => {
      const image_date = new Date(image.created_at);
      return image_date.toDateString() === date.toDateString() || !dayByDay;
    });
  }, [images, trip, untimed_trips_selected_date, dayByDay]);

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

    return categories;

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

  const found_folder: { name: string } | undefined = folders.find(
    (folders) => folders.name === openCategoryFolder
  );

  return (
    <div>
      <div className="flex justify-center space-x-4 w-full">
        {/* Button to add a category */}
        <div className="flex justify-center m-3  ">
          <div className="flex items-center p-2 cursor-pointer w-1/2 rounded-lg hover:bg-blue-800">
            <FaPlus
              onClick={() => {
                CompareViewStore.setState((state) => {
                  return {
                    ...state,
                    add_category_modal_open: true,
                  };
                });
              }}
              className="text-2xl cursor-pointer"
              title="Add Category"
            />
            <div className="m-3">Add Category</div>
          </div>

          <label className="flex items-center cursor-pointer w-1/2">
            <div
              className="relative"
              title={dayByDay ? 'All Images' : 'Day By Day'}
            >
              <input
                type="checkbox"
                checked={dayByDay}
                onChange={(e) => setDayByDay(e.target.checked)}
                className="sr-only"
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  dayByDay ? 'transform translate-x-full bg-neon-green' : ''
                }`}
              ></div>
            </div>
            <span className="ml-3 text-white">
              {dayByDay ? 'Day By Day' : 'All Images'}
            </span>
          </label>
        </div>
        {add_category_modal_open && <AddCategoryForm />}
      </div>
      <DndProvider backend={HTML5Backend}>
        {/* Buttons to Save (Calls saveImages and saveTrip)  - then sets local trip*/}

        {dayByDay && <Banner_Component />}
        <div className="flex flex-wrap w-full flex-row justify-around">
          {folders.map((folder) => (
            <ImageDragFolder
              key={folder.name}
              folder={folder}
              images={(images || []).filter(
                (img) => img.category === folder.name
              )}
              onDropImage={handleDropImage}
              onDragEnd={handleDragEnd}
              opened={false}
              setOpen={(name: string | null) => setOpenCategoryFolder(name)}
            />
          ))}
        </div>
        <div className="flex flex-wrap w-full flex-row justify-around mt-10 ml-5 items-center">
          {found_folder ? (
            <ImageDragFolder
              key={found_folder.name}
              folder={found_folder}
              images={(images || []).filter(
                (img) => img.category === found_folder.name
              )}
              onDropImage={handleDropImage}
              onDragEnd={handleDragEnd}
              opened={true}
              setOpen={(name: string | null) => setOpenCategoryFolder(name)}
            />
          ) : (
            <h1 className="text-2xl text-gray-500">No Folder Opened</h1>
          )}
        </div>

        {images_for_day_and_unassigned.length == 0 && (
          <div className="flex justify-center items-center w-full h-96">
            <h1 className="text-2xl text-gray-500">
              {dayByDay
                ? 'No Images for this day'
                : 'No Unassigned Images For Trip'}
            </h1>
          </div>
        )}
        <ImageGallery
          images={images_for_day_and_unassigned}
          onDragEnd={handleDragEnd}
          folders={folders}
          addImageToFolder={addImageToFolder}
        />
      </DndProvider>
    </div>
  );
};

const ImageGallery = ({
  images,
  onDragEnd,
  folders,
  addImageToFolder,
}: {
  images: Image[];
  onDragEnd: (id: string) => void;
  folders: { name: string }[];
  addImageToFolder: (image: Image, folderName: string) => void;
}) => {
  const [dropdownImage, setDropdownImage] = useState<Image | null>(null);
  const handleFolderSelect = (folderName: string) => {
    addImageToFolder(dropdownImage as Image, folderName);
    setDropdownImage(null);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 mt-10">
      {images.map((image) => (
        <div
          className="flex-col items-center border dark:border-white rounded p-1"
          key={image.id}
        >
          <div className="relative">
            {dropdownImage != image ? (
              <FaCaretDown
                className="text-2xl cursor-pointer dark:text-white"
                onClick={() => setDropdownImage(image)}
                size={30}
              />
            ) : (
              <FaCaretUp
                className="text-2xl cursor-pointer dark:text-white"
                onClick={() => setDropdownImage(null)}
                size={30}
              />
            )}

            {dropdownImage === image && (
              <div className="absolute overflow-y-auto max-h-[150px] top-8 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-10">
                {folders.map((folder) => (
                  <div
                    key={folder.name}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleFolderSelect(folder.name)}
                  >
                    {folder.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <ImageItem image={image} onDragEnd={onDragEnd} />
          <h3 className="text-center text-sm dark:text-white">{image.name}</h3>
        </div>
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

  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleEditImage = async () => {
    if (!editingImage) return;
    if (!trip) return;

    const new_image = {
      ...editingImage,
      name: editedName,
    };

    const res = await editImage.mutate({
      image: new_image,
      trip,
    });

    //set the local images
  };

  const editedFieldRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={` ${opened ? `w-full grow-1 mb-4` : `m-1 grow-1`}`}>
      {!opened ? (
        <div
          ref={dropRef}
          className="w-full h-[40px] w-[300px] grow-1 mr-6 ml-6 flex-grow flex flex-wrap flex-row items-center p-1 bg-white shadow-md rounded-lg border-1 order-yellow-500"
        >
          <FaFolder className="text-6xl text-yellow-500 mr-3 ml-6" size={30} />
          <div className="flex flex-row items-center">
            <FaChevronDown
              className="text-2xl cursor-pointer dark:text-black"
              onClick={() => setOpen(folder.name)}
              size={24}
            />
            <h2 className="text-md ml-5 font-semibold">{folder.name}</h2>
            <div className="relative w-full flex flex-wrap flex-row pl-5">
              <p className="dark:text-black text-sm">
                {' '}
                ({images.length} Images)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={dropRef}
          className="w-full grow-1 flex-grow flex flex-wrap flex-row items-center bg-white  dark:bg-gray-800 shadow-md rounded-lg border-yellow-500"
        >
          <div className="w-full flex flex-row ">
            <FaFolder className="text-6xl text-yellow-500 mr-2" size={24} />
            <FaChevronUp
              className="text-2xl cursor-pointer dark:text-black"
              onClick={() => setOpen(null)}
              size={24}
            />
            <h2 className="text-xl ml-5 font-semibold dark:text-yellow-100">
              {folder.name}
            </h2>
          </div>
          {/* Mow -> The Open Folder Contains List of images*/}
          <div className="w-full flex flex-row overflow-x-auto">
            <div className="flex flex-row min-w-[400px] max-w-[400px]  items-start">
              <div className="w-full flex flex-col items-start max-h-[420px] overflow-y-auto custom-scrollbar">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`flex w-full justify-between items-center border rounded  ${
                      selectedImage?.id === image.id
                        ? 'border-4 dark:border-neon-green'
                        : ''
                    }  `}
                  >
                    {editingImage?.id !== image.id ? (
                      <div className="flex flex-row flex-grow ml-3">
                        <p
                          className="text-black font-bold text-sm dark:text-white "
                          onClick={() => {
                            if (selectedImage === image) {
                              setSelectedImage(null);
                            } else {
                              setSelectedImage(image);
                            }
                          }}
                        >
                          {image.name}
                        </p>
                        <FaPen
                          size={20}
                          onClick={() => {
                            setEditingImage(image);
                            setEditedName(image.name);
                            setSelectedImage(image);
                            // Focus on the input
                            setTimeout(() => {
                              editedFieldRef.current?.focus();
                            }, 500);
                          }}
                          className="text-2xl cursor-pointer dark:text-black ml-3 mr-3"
                        />
                      </div>
                    ) : (
                      <input
                        ref={editedFieldRef}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-2/3 text-black dark:text-black"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditImage();
                            setEditingImage(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingImage(null);
                          }
                        }}
                      />
                    )}
                    <div
                      className="flex-shrink-0 w-[32px]"
                      onClick={() => {
                        if (selectedImage === image) {
                          setSelectedImage(null);
                        } else {
                          setSelectedImage(image);
                        }
                      }}
                    >
                      <ImageItemClosed image={image} onDragEnd={onDragEnd} />
                    </div>
                    <div>
                      <FaTimes
                        onClick={() => removeImageFromCategory(image)}
                        className="text-2xl ml-3 mr-3 cursor-pointer dark:text-white hover:text-red-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Image Preview Taking Up Rest of the Space */}
            <div
              className={`relative  flex flex-wrap flex-row flex-grow  ${
                selectedImage
                  ? 'h-[400px] w-[400px] min-h-[400px] min-w-[400px]'
                  : ''
              } `}
            >
              {selectedImage && (
                <div className="w-full h-full ">
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
      className={` relative  border rounded w-full  h-[40px]  w-[40px]  ${
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
      className={` relative h-[164px]  w-full ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <NextImage
        src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
        alt={`Image for ${image.created_at}`}
        layout="fill"
        objectFit="contain"
        sizes="128px"
      />
    </div>
  );
};

export default CategoryView;
