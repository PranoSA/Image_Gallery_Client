'use client';

import { Image as Image, Trip, Category } from '@/definitions/Trip_View';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import TripContext from '@/components/TripContext';

import {
  useQueryTrip,
  useQueryTripImages,
  useQueryTripPaths,
  useTripViewStore,
  tripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { dateFromString } from '@/components/Trip_View/Time_Functions';

import { Banner_Component } from '@/components/Trip_View/Banner_Component';
import NextImage from 'next/image';

//import folder icon from FaIcons
import { FaChevronUp, FaFolder } from 'react-icons/fa';

//import trash icon from FaIcons
import { FaTrash } from 'react-icons/fa';

//import icon that intuitively looks like "open up"
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

const useTripContext = () => {
  return useContext(TripContext);
};

interface TripProviderProps {
  children: React.ReactNode;
  id: string;
}

const TripProvider = ({ children, id }: TripProviderProps) => {
  const [bearer_token, setBearerToken] = useState<string | null>(null);

  const setBearerTokenFunction = (token: string) => {
    setBearerToken(token);
  };

  return (
    <TripContext.Provider
      value={{ id, bearer_token, setBearerToken: setBearerTokenFunction }}
    >
      {children}
    </TripContext.Provider>
  );
};

const ItemTypes = {
  IMAGE: 'image',
};

//save categorized trip
const saveCategorizedTrip = async (trip: Trip) => {
  const api_url = `${process.env.NEXT_PUBLIC_API_URL}/trips/${trip.id}`;

  const res = await axios.put(api_url, trip);

  return res.data;

  fetch(api_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trip),
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
};

//save categorized images
const saveCategorizedImages = (
  images: Image[],
  trip_id: string,
  old_images: Image[]
) => {
  const api_url = `${process.env.NEXT_PUBLIC_API_URL}/trip/${trip_id}/images/`;

  /// print all ima

  const filtered_images = images.filter((image) => {
    const old_image = old_images.find((old_image) => old_image.id === image.id);

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

const queryClient = new QueryClient();

const PageWithProvider: React.FC<{ params: { id: string } }> = ({
  params: { id },
}) => {
  return (
    <TripProvider id={id || '0'}>
      <QueryClientProvider client={queryClient}>
        <ImageFolderComponents />
      </QueryClientProvider>
    </TripProvider>
  );
};

const Page = () => {
  const { id } = useTripContext();

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  //same with images
  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(id);

  //iamges will have optional category string
  //either no category or '' category means unassigned

  const imageUnassigned = (image: Image): boolean => {
    return !image.category || image.category === '';
  };

  const imagesUnassigned: Image[] = images?.filter(imageUnassigned) || [];
};

interface AddCategoryFormProps {
  onAddCategory: (category: Category) => void;
}

const AddCategoryForm = ({ onAddCategory }: AddCategoryFormProps) => {
  const [category, setCategory] = useState<Category>({
    category: '',
    start_date: '',
    end_date: '',
    child_categories: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory((prevCategory) => ({
      ...prevCategory,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onAddCategory(category);
    //clear the form
    setCategory({
      category: '',
      start_date: '',
      end_date: '',
      child_categories: [],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg"
    >
      <div className="mb-4">
        <label
          htmlFor="category"
          className="block text-gray-700 font-bold mb-2"
        >
          Category
        </label>
        <input
          type="text"
          name="category"
          id="category"
          placeholder="Category"
          value={category.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="start_date"
          className="block text-gray-700 font-bold mb-2"
        >
          Start Date
        </label>
        <input
          type="date"
          name="start_date"
          id="start_date"
          value={category.start_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="end_date"
          className="block text-gray-700 font-bold mb-2"
        >
          End Date
        </label>
        <input
          type="date"
          name="end_date"
          id="end_date"
          value={category.end_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Category
      </button>
    </form>
  );
};

const ImageFolderComponents = () => {
  const { id } = useTripContext();

  const [localImages, setLocalImages] = useState<Image[]>([]);

  //local trip that you can add categories to or remove categories from
  const [localTrip, setLocalTrip] = useState<Trip | null>(null);

  const [openCategoryFolder, setOpenCategoryFolder] = useState<string | null>(
    null
  );

  const onAddCategory = (category: Category) => {
    if (!localTrip) {
      return;
    }
    const newTrip = {
      ...localTrip,
      categories: [...localTrip.categories, category],
    };

    setLocalTrip(newTrip);
  };

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  //same with images
  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(id);

  useEffect(() => {
    if (images) {
      //deep copy the images
      setLocalImages(JSON.parse(JSON.stringify(images)));
    }
  }, [images]);

  useEffect(() => {
    if (trip) {
      setLocalTrip(trip);
    }
  }, [trip]);

  const { selected_date } = useTripViewStore();

  const imagesForDay = useMemo(() => {
    return localImages.filter((image) => {
      const start_date = dateFromString(trip?.start_date || '1970-01-01');
      start_date.setDate(start_date.getDate() + selected_date);

      const image_date = dateFromString(image.created_at);

      return start_date.toDateString() === image_date.toDateString();
    });
  }, [localImages, selected_date, trip]);

  // Retreive Categories From Trip
  const categories = trip?.categories || [];

  //get folders that overlap with the selected date

  const current_date: Date = useMemo(() => {
    const start_date = dateFromString(trip?.start_date || '1970-01-01');
    start_date.setDate(start_date.getDate() + selected_date);

    return start_date;
  }, [selected_date, trip]);

  const categories_on_date = useMemo(() => {
    const categories = localTrip?.categories || [];

    return categories.filter((category) => {
      const start_date = dateFromString(category.start_date);
      const end_date = dateFromString(category.end_date);

      return start_date <= current_date && current_date <= end_date;
    });
  }, [localTrip, current_date]);

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
        !folders.find((folder) => folder.name === image.category)
      );
    };

    return imagesForDay.filter(imageUnassigned);
  }, [imagesForDay, localTrip]);

  // now, render the banner component to go day by day
  //and render the folers that will be the target for the images

  const handleDropImage = (imageId: Image, folderName: string) => {
    //set the category of the image to the folder name
    //update the image
    //update the image store

    //update local images
    setLocalImages((prevImages) =>
      prevImages.map((img) =>
        img.id === imageId.id ? { ...img, category: folderName } : img
      )
    );
  };

  const handleDragEnd = (id: string) => {
    //find that image with id and set the category to ''
    setLocalImages((prevImages) =>
      prevImages.map((img) => (img.id === id ? { ...img, category: '' } : img))
    );
  };

  if (tripLoading || imagesLoading) {
    return <div>Loading...</div>;
  }

  if (!images || !trip) {
    return <div>Error...</div>;
  }

  const saveState = async () => {
    const trip_id = id;

    try {
      const _ = await saveCategorizedImages(localImages, trip_id, images);

      //save the trip
      const __ = await saveCategorizedTrip(localTrip as Trip);

      //if both work, set trip to local trip
      //and set images to local images
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <AddCategoryForm onAddCategory={onAddCategory} />
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
              images={imagesForDay.filter(
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

//Now a gallery to view the images to drag and drop
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

type FolderPreviewProps = {
  folder: { name: string };
  images: Image[];
  onDropImage: (folderName: string) => void;
};

const FolderPreview: React.FC<FolderPreviewProps> = ({
  folder,
  images,
  onDropImage,
}) => {
  return (
    <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
      <FaFolder className="text-6xl text-yellow-500 mb-2" />
      <h2 className="text-xl font-semibold mb-2">{folder.name}</h2>
      <div className="relative w-24 h-24 mb-2">
        {images.slice(0, 3).map((image, index) => (
          <NextImage
            key={image.id}
            src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
            alt={image.name}
            className={`absolute w-full h-full object-cover rounded-lg border-2 border-white ${
              index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'
            }`}
            style={{ top: index * 5, left: index * 5 }}
          />
        ))}
        {images.length > 3 && (
          <div className="absolute w-full h-full flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-40">
            <span className="text-white text-lg font-bold">
              +{images.length - 3}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={() => onDropImage(folder.name)}
        className="mt-2 bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Image
      </button>
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
      className={`p-2 h-[128px] border rounded ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <NextImage
        src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
        alt={`Image for ${image.created_at}`}
        width={128}
        height={128}
        className="object-contain rounded-lg shadow-md"
        layout="fixed"
      />
    </div>
  );
};

const Folder = ({
  folder,
  images,
  onDropImage,
}: {
  folder: { name: string };
  images: Image[];
  onDropImage: (id: number, folderName: string) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.IMAGE,
    drop: (item: { id: number }) => onDropImage(item.id, folder.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const dropRef = React.useRef<HTMLDivElement>(null);
  drop(dropRef);

  const onDragEnd = (id: string) => {};

  return (
    <div
      ref={dropRef}
      className={`p-4 border rounded ${isOver ? 'bg-blue-100' : 'bg-white'}`}
    >
      <h2 className="text-xl font-semibold">{folder.name}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.map((image: Image) => (
          <ImageItem
            key={image.id}
            image={image}
            onDropImage={undefined}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

const FolderView = () => {
  const [folders, setFolders] = useState([
    { name: 'Folder 1' },
    { name: 'Folder 2' },
  ]);

  const [images, setImages] = useState<
    { id: number; name: string; url: string; folder: string | null }[]
  >([
    {
      id: 1,
      name: 'Image 1',
      url: 'https://via.placeholder.com/150',
      folder: null,
    },
    {
      id: 2,
      name: 'Image 2',
      url: 'https://via.placeholder.com/150',
      folder: null,
    },
  ]);

  const handleDropImage = (imageId: number, folderName: string) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === imageId ? { ...img, folder: folderName } : img
      )
    );
  };

  const filterImagesByFolder = (folderName: string): Image[] => {
    const filteredImages = images.filter((img) => img.folder === folderName);
    // @ts-ignore
    return filteredImages || [];
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Folder View</h1>
        <div className="grid grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Folder
              key={folder.name}
              folder={folder}
              images={filterImagesByFolder(folder.name)}
              onDropImage={handleDropImage}
            />
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Unassigned Images</h2>
          <div className="grid grid-cols-2 gap-2">
            {images
              .filter((img) => !img.folder)
              .map((image) => (
                // @ts-ignore
                <ImageItem key={image.id} image={image} />
              ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

//export default FolderView;

//export default PageWithProvider;

export default PageWithProvider;
