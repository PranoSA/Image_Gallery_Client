'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Heatmap } from 'ol/layer';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiEye } from 'react-icons/hi';
import { HiX } from 'react-icons/hi';
import { HiChevronDoubleDown } from 'react-icons/hi';
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
} from 'react-icons/fa';

import axios from 'axios';
import NextImage from 'next/image';
import Modal from '@/components/PathModal';

import { KML } from 'ol/format';
import { HiOutlinePencil } from 'react-icons/hi';

import type { Image, Path, Trip } from '@/definitions/Trip_View';

import CoordinateForm from '@/components/CoordinateForm';
import PathModal from '@/components/PathModal';
import PathMapModal from '@/components/PathMapModal';

//process.env.NEXT_PUBLIC_API_URL

export default function Page({ params: { id } }: { params: { id: string } }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //populated on loading
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pathModalOpen, setPathModalOpen] = useState(false);

  // Where the Image Selection Is Stored
  const [currentDay, setCurrentDay] = useState<string | null>(null);

  const [comparingPhotos, setComparingPhotos] = useState<boolean>(false);

  const [menu, showMenu] = useState<boolean>(false);

  const [dayDescription, setDayDescription] = useState<string | null>(null);

  const [daySummaries, setDaySummaries] = useState<string | null>(null);

  const [editingDaySummary, setEditingDaySummary] = useState<boolean>(false);

  useEffect(() => {
    if (!trip || !currentDay) return;

    const fetchDayDescription = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/day_summaries/${currentDay}`
        );
        setDayDescription(response.data[0].summary);
      } catch (err) {
        setDayDescription(null);
        //console.error('Error fetching day description:', err);
      }
    };

    fetchDayDescription();
  }, [trip, currentDay]);

  const submitDayDescription = async () => {
    //find the id of the current day
    if (!currentDay || !trip) return;

    //The Day ID is the [day, tripid] in the day_summaries table

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/day_summaries/${currentDay}`,
        {
          tripid: id,
          summary: dayDescription,
        }
      );
      setEditingDaySummary(false);
    } catch (err) {
      console.error('Error submitting day description:', err);
    }
  };

  // map to find the path id from the feature
  const pathFromFeature = useRef<Map>(new Map());
  useEffect(() => {
    console.log('id is', id);
    if (id) {
      const fetchTripDetails = async () => {
        try {
          const tripResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}`
          );
          const photosResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images`
          );
          const pathsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/paths`
          );

          const tripData = tripResponse.data[0];
          tripData.images = photosResponse.data;
          tripData.paths = pathsResponse.data;

          setTrip(tripData);

          setCurrentDay(tripData.start_date);
        } catch (err) {
          setError('Error fetching trip details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      console.log('Finished Fetching');
      fetchTripDetails();
    }
  }, []);

  useEffect(() => {
    if (!currentDay || !trip) return;
    const fetchKMLFiles = async () => {
      const filteredPaths = trip.paths.filter(
        (path) => path.start_date <= currentDay && path.end_date >= currentDay
      );

      //remove old paths
      //except the image layer

      mapInstanceRef.current?.getLayers().forEach((layer) => {
        if (layer instanceof VectorLayer) {
          if (layer.getSource() !== imageVectorSource.current) {
            mapInstanceRef.current?.removeLayer(layer);
          }
        }
      });

      for (const path of filteredPaths) {
        try {
          const kmlSource = new VectorSource({
            url: `${process.env.NEXT_PUBLIC_STATIC_KML_URL}/${path.kml_file}`,
            format: new KML({
              extractStyles: false,
            }),
          });

          //iterate through all the features and add them to the map
          kmlSource.on('addfeature', (event) => {
            const feature = event.feature;

            console.log('Feature:', feature);

            if (!feature) {
              return;
            }
            //@ts-ignore
            const id = feature.ol_uid || feature.getId();
            if (!id) {
              console.error('Feature ID is null');
              return;
            }

            pathFromFeature.current.set(id, path.id);

            console.log('Feature ID', id);
            console.log('Path ID', path.id);
          });

          // Apply styles
          const style = new Style({
            stroke: new Stroke({
              color: [path.color_r, path.color_g, path.color_b, 1], // RGBA array
              width: path.thickness,
              lineDash:
                path.style === 'dashed'
                  ? [4, 8]
                  : path.style === 'dotted'
                  ? [1, 4]
                  : path.style === 'solid'
                  ? []
                  : undefined,
            }),
          });

          if (!kmlSource) {
            console.error('kmlSource is null');
            return;
          }

          // Add the KML source to the map
          // Assuming you have a map instance

          mapInstanceRef.current?.addLayer(
            new VectorLayer({
              source: kmlSource,
              style: style,
            })
          );
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchKMLFiles();
  }, [currentDay]);

  //add interactivity to the map

  const [pathModalSelected, setPathModalSelected] = useState<Path | null>(null);
  const [pathModalPosition, setPathModalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  // if selecting the path, then it shows a pop up modal

  mapInstanceRef.current?.on('click', (event) => {
    //get the feature at the clicked location
    const feature = mapInstanceRef.current?.forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature
    );

    if (feature) {
      //show the modal
      //set the path to the selected path
      //set the modal to open
      console.log('Feature:', feature);
      //@ts-ignore
      const featureId = feature.ol_uid || feature.getId();
      console.log('Feature Id', featureId);
      //get the path id from the feature
      const pathId = pathFromFeature.current.get(featureId);

      console.log('Path ID:', pathId);

      //find it in the trip.paths
      const path = trip?.paths.find((p) => p.id === pathId);

      if (!path) {
        console.error('Path not found');
        return;
      }
      setPathModalSelected(path);
      setPathModalPosition({
        x: event.pixel[0],
        y: event.pixel[1],
      });
      console.log('Path:', path);
    }
  });

  // Image Locations For The Map
  const [selectedImage, setSelectedImage] = useState<Image | null>();

  //Vector Source To Store Image Locations
  const imageVectorSource = useRef(new VectorSource());

  // Vector Source to Store Paths Loadied From The Server

  const [paths, setPaths] = useState<Path[]>([]);

  //This will populate vector sources through KML files

  const selectedFeature = useRef<Feature | null>(null);

  // Image Heat Map Layer For The Map
  // only for images for the current day

  const imageHeatMapLayer = useRef<Heatmap | null>(null);

  useEffect(() => {
    //create imageVectorSource based on the current day

    const tempImageVectorSource = new VectorSource();

    //Remember - this vector source doesn't need to be displayed, its only for
    //the heatmap for the day

    //add images for that day to the vector source

    trip?.images
      .filter((i) => i.created_at.split('T')[0] === currentDay)
      .forEach((image) => {
        const feature = new Feature({
          geometry: new Point(
            fromLonLat([parseFloat(image.long), parseFloat(image.lat)])
          ),
          ol_uid: image.id,
          id: image.id,
          Id: image.id,
        });
        tempImageVectorSource.addFeature(feature);
      });

    imageHeatMapLayer.current = new Heatmap({
      source: tempImageVectorSource,
      blur: 10,
      radius: 5,
      weight: function (feature) {
        return 1;
      },
    });

    //add to map
    mapInstanceRef.current?.addLayer(imageHeatMapLayer.current);
  }, [currentDay, mapInstanceRef.current, trip]);

  // Get Trip Data
  // Then -> Get Image Data and Get Path Data

  // This is necessary to render the map
  // the reason you need mapInstanceRef is because the map
  // will render twice because
  useEffect(() => {
    console.log('Map Rendering');
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: imageVectorSource.current,
            zIndex: 1000,
          }),
        ],
        view: new View({
          center: fromLonLat([2.3522, 48.8566]),
          zoom: 4,
        }),
      });
    }
  }, [mapRef.current]);

  useEffect(() => {
    console.log('currentDay', currentDay);
    if (trip && currentDay) {
      const imagesForDay = trip.images.filter(
        (image) => image.created_at === currentDay
      );
      setSelectedImage(null);
    }
  }, [trip, currentDay]);

  const handleDayChange = (direction: 'prev' | 'next') => {
    if (trip && currentDay) {
      const currentDate = new Date(currentDay);
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1));
      const newDateString = newDate.toISOString().split('T')[0];
      console.log('newDateString', newDateString);
      if (newDateString >= trip.start_date && newDateString <= trip.end_date) {
        setCurrentDay(newDateString);
      }
      setSelectedImage(null);

      //find center of trip through the images for that day

      if (
        trip.images.filter(
          (image) => image.created_at.split('T')[0] === newDateString
        ).length > 0
      ) {
        const candidateImages = trip.images
          .filter((image) => image.created_at.split('T')[0] === newDateString)
          .filter((image) => image.lat && image.long)
          .filter(
            (image) =>
              parseFloat(image.lat) !== 0 && parseFloat(image.long) !== 0
          );

        const total_lat = candidateImages.reduce(
          (acc, image) => acc + parseFloat(image.lat),
          0
        );

        const total_long = candidateImages.reduce(
          (acc, image) => acc + parseFloat(image.long),
          0
        );

        const center_lat = total_lat / candidateImages.length;

        const center_long = total_long / candidateImages.length;

        // set the center of the map to the center of the trip
        mapInstanceRef.current
          ?.getView()
          .setCenter(fromLonLat([center_long, center_lat]));

        //set zoom level based on the size of the box
        // max_lat, min_lat, max_long, min_long

        const max_lat = candidateImages.reduce(
          (acc, image) => Math.max(acc, parseFloat(image.lat)),
          -Infinity
        );

        const min_lat = candidateImages.reduce(
          (acc, image) => Math.min(acc, parseFloat(image.lat)),
          Infinity
        );

        const max_long = candidateImages.reduce(
          (acc, image) => Math.max(acc, parseFloat(image.long)),
          -Infinity
        );

        const min_long = candidateImages.reduce(
          (acc, image) => Math.min(acc, parseFloat(image.long)),
          Infinity
        );

        const lat_diff = max_lat - min_lat;
        const long_diff = max_long - min_long;

        const max_diff = Math.max(lat_diff, long_diff);

        const zoom = Math.floor(9 - Math.log2(max_diff));

        mapInstanceRef.current?.getView().setZoom(zoom);
      }

      //Clear the feature from the map
      if (selectedFeature.current) {
        imageVectorSource.current.removeFeature(selectedFeature.current);
        selectedFeature.current = null;
      }
    }

    // change heat map layer
    if (imageHeatMapLayer.current) {
      mapInstanceRef.current?.removeLayer(imageHeatMapLayer.current);
    }
  };

  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  useEffect(() => {
    console.log('selectedImages', selectedImages);
  }, [selectedImages]);

  const handleImageClick = (image: Image) => {
    // Will Behave Differently if Comparing Photos
    // Then you Append to the Selected Images

    if (selectedFeature && selectedFeature.current?.get('id') === image.id) {
      imageVectorSource.current.removeFeature(selectedFeature.current);
      setSelectedImage(null);
      selectedFeature.current = null;
    } else {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat([parseFloat(image.long), parseFloat(image.lat)])
        ),
        ol_uid: image.id,
        id: image.id,
        Id: image.id,
      });
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({
              color: 'black',
              width: 2,
            }),
          }),
        })
      );
      //remove old feature
      if (selectedFeature.current) {
        imageVectorSource.current.removeFeature(selectedFeature.current);
      }
      selectedFeature.current = feature;
      setSelectedImage(image);
      imageVectorSource.current.addFeature(feature);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const [doneSelectedImages, setDoneSelectedImages] = useState<boolean>(false);
  const [editingImage, setEditingImage] = useState<boolean>(false);
  const [editedImage, setEditedImage] = useState<Image | null>(null);

  /**
   *
  This is for fields like name, description, created_at

   */
  const handleEditedImageChange = (e: any) => {
    const field = e.target.name;

    const value = e.target.value;

    if (!editedImage) return;

    setEditedImage({
      ...editedImage,
      [field]: value,
    });
  };

  const [previewImage, setPreviewImage] = useState<number | null>(null);

  const submitEditedImage = async () => {
    if (!editedImage) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images/${editedImage.id}`,
        editedImage
      );
      setEditingImage(false);
      setEditedImage(null);
    } catch (err) {
      console.error('Error editing image:', err);
    }
  };

  const handleCloseModal = () => {
    setPathModalOpen(false);
  };

  const handleOpenModal = () => {
    setPathModalOpen(true);
  };

  const submitModal = (formData: any) => {
    const formDataObj = new FormData();
    formDataObj.append('kml_file', formData.file);
    formDataObj.append('description', formData.description);
    formDataObj.append('name', formData.name);
    formDataObj.append('color_r', formData.color_r);
    formDataObj.append('color_g', formData.color_g);
    formDataObj.append('color_b', formData.color_b);
    formDataObj.append('style', formData.style);
    formDataObj.append('thickness', formData.width);
    formDataObj.append('start_date', formData.start_date);
    formDataObj.append('end_date', formData.end_date);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/paths`, {
      method: 'POST',

      body: formDataObj,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        handleCloseModal();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Date of the Edited Image
    if (!editedImage) return;

    //This will splitting the created_at and changing the date and joining the time back
    const [date, time] = e.target.value.split('T');

    const new_created_at = `${date}T${editedImage.created_at.split('T')[1]}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Change the Time of the Edited Image
    if (!editedImage) return;

    //This will splitting the created_at and changing the time and joining the date back
    const [date, time] = editedImage.created_at.split('T');

    const new_time = e.target.value;

    const new_created_at = `${
      editedImage.created_at.split('T')[0]
    }T${new_time}`;

    setEditedImage({
      ...editedImage,
      created_at: new_created_at,
    });
  };

  const handleEditImage = (image: Image) => {
    setEditingImage(true);
    setEditedImage(image);
    //set degrees minutes seconds
  };

  const cancelEditImage = () => {
    setEditingImage(false);
    setEditedImage(null);
    //clear degrees minutes seconds
  };

  const handleComparePhotosSelection = (image: Image) => {
    // Add Image to Selected Images
    // unless, it is already in the selected images

    const new_images = selectedImages.includes(image)
      ? selectedImages.filter((i) => i !== image)
      : [...selectedImages, image];

    setSelectedImages(new_images);
  };

  if (doneSelectedImages) {
    //This will show all the images in a larger gallery [say, the width of the screen]
    //Then show an X button above each image
    //when you click -> remove the image from the selected images
    // Send DELETE request to the API
    // /trip/:tripid/images/:id

    const handleDeleteImage = async (image: Image) => {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/trip/${id}/images/${image.id}`
        );
        setSelectedImages(selectedImages.filter((i) => i !== image));

        //also delete from trip.images

        if (!trip) return;

        const new_trip: Trip = {
          ...trip,
          images: trip.images.filter((i) => i.id !== image.id),
        };

        setTrip(new_trip);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
      <div className="flex flex-wrap space-around">
        {selectedImages.map((image) => (
          <div key={image.id} className="relative">
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              width={500}
              height={500}
            />
            <button className="" onClick={() => handleDeleteImage(image)}>
              X
            </button>
          </div>
        ))}
        <button
          onClick={() => setDoneSelectedImages(false)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Done Selecting Images
        </button>
      </div>
    );
  }

  const imagesForDay =
    trip?.images
      .filter((i) => i.created_at.split('T')[0] === currentDay)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)) || [];

  if (comparingPhotos) {
    // Have the Image Gallery for that day instead of the map
    // select the images to compare
    // then click a "done button"
    // this sets doneSelectedImages to true
    return (
      <div className="">
        <div className="gallery mt-4">
          {imagesForDay.map((image) => (
            <div key={image.id}>
              <HiOutlinePencil />
              <NextImage
                src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
                alt={`Image for ${image.created_at}`}
                width={100}
                height={100}
                onClick={() => {
                  handleComparePhotosSelection(image);
                }}
                style={{
                  cursor: 'pointer',
                  margin: '10px',
                  width: '100px',
                  height: '100px',
                  border: selectedImages.includes(image)
                    ? '5px solid blue'
                    : 'none',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <button onClick={() => setComparingPhotos(false)}>Cancel</button>
        </div>
        <div className="flex justify-center items-center">
          <button onClick={() => setDoneSelectedImages(true)}>
            Finish Selecting Images
          </button>
        </div>
      </div>
    );
  }

  const calculateDaysElapsed = (
    startDate: string | null,
    currentDate: string | null
  ) => {
    if (!startDate || !currentDate) return 0;
    const start = new Date(startDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const toggleMenu = () => {
    showMenu(!menu);
  };

  const handlePrevImage = () => {
    if (previewImage) {
      if (previewImage === 0) return;
      setPreviewImage(previewImage - 1);
    }
  };

  const handleNextImage = () => {
    if (!trip) return;

    if (previewImage) {
      if (previewImage === trip.images.length - 1) return;
      setPreviewImage(previewImage + 1);
    }
  };

  return (
    <div>
      {pathModalSelected != null && pathModalPosition && (
        <PathMapModal
          path={pathModalSelected}
          closeModal={() => {
            setPathModalSelected(null);
          }}
          position={pathModalPosition}
        />
      )}
      <div className="relative inline-block text-left">
        <button
          onClick={toggleMenu}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {menu ? 'Close Menu' : 'Open Menu'}
          {menu ? (
            <FaChevronUp className="ml-2" />
          ) : (
            <FaChevronDown className="ml-2" />
          )}
        </button>
        {menu && (
          <div className="z-50 origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <button
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                onClick={() => setComparingPhotos(!comparingPhotos)}
              >
                {comparingPhotos ? 'Stop Comparing Photos' : 'Compare Photos'}
              </button>
              <Modal
                isOpen={pathModalOpen}
                onClose={() => setPathModalOpen(!pathModalOpen)}
                onSubmit={submitModal}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-around items-center mb-4">
        <FaChevronLeft
          onClick={() => handleDayChange('prev')}
          className="cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-full flex flex-col items-center">
            <span className="w-full text-center">
              Day #{' '}
              {Math.floor(
                calculateDaysElapsed(trip?.start_date || currentDay, currentDay)
              )}{' '}
              /{' '}
              {calculateDaysElapsed(
                trip?.start_date || currentDay,
                trip?.end_date || currentDay
              )}{' '}
              :
            </span>
            <span className="w-full text-center">{currentDay}</span>
          </div>
          {/* Display the Day Summary, and then allow editing of it */}
          <div className="flex flex-col items-center mt-4">
            <div className="w-full flex justify-center items-center">
              <HiOutlinePencil
                onClick={() => setEditingDaySummary(true)}
                className="cursor-pointer"
              />
            </div>
            {editingDaySummary ? (
              <div className="w-full flex flex-col items-center">
                <textarea
                  value={dayDescription || ''}
                  onChange={(e) => setDayDescription(e.target.value)}
                  className="w-full h-40 p-4 max-w-2xl"
                ></textarea>
                <button onClick={submitDayDescription} className="mt-2">
                  Save
                </button>
                <button
                  onClick={() => setEditingDaySummary(false)}
                  disabled={!editingDaySummary}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="w-full text-center">{dayDescription}</div>
            )}
          </div>
        </div>
        <FaChevronRight
          onClick={() => handleDayChange('next')}
          className="cursor-pointer"
        />
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '50vh' }}></div>
      <div className="gallery mt-4">
        {imagesForDay.map((image, i) => (
          <div key={image.id}>
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              width={100}
              height={100}
              onClick={() => handleImageClick(image)}
              style={{
                cursor: 'pointer',
                margin: '10px',
                width: '100px',
                height: '100px',
                border: comparingPhotos
                  ? selectedImages.includes(image)
                    ? '5 px solid'
                    : 'none'
                  : selectedImage && selectedImage.id === image.id
                  ? '5px solid blue'
                  : 'none',
              }}
            />
            <HiOutlinePencil
              onClick={() => handleEditImage(image)}
              className="cursor-pointer"
            />
            <HiEye
              onClick={() => setPreviewImage(i)}
              className="cursor-pointer"
            />
          </div>
        ))}
      </div>
      {previewImage && trip && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <span
              className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
              onClick={() => setPreviewImage(null)}
            >
              &times;
            </span>
            <button
              className="absolute left-4 text-white text-3xl cursor-pointer"
              onClick={handlePrevImage}
              disabled={previewImage === 0}
            >
              <FaChevronLeft />
            </button>
            <NextImage
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${imagesForDay[previewImage].file_path}`}
              alt={`Image for ${trip.images[previewImage].created_at}`}
              width={500}
              height={500}
            />
            <button
              className="absolute right-4 text-white text-3xl cursor-pointer"
              onClick={handleNextImage}
              disabled={previewImage === imagesForDay.length - 1}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
      {editingImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEditedImage();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={editedImage?.description || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Add created_at,  */}
              <div className="mb-4">
                <label className="block text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editedImage?.name || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Description:</label>
                <input
                  type="text"
                  name="description"
                  value={editedImage?.description || ''}
                  onChange={handleEditedImageChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Created At:</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={editedImage?.created_at.split('T')[0]}
                    onChange={handleDateChange}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="time"
                    value={
                      editedImage?.created_at
                        .split('T')[1]
                        .split('+')[0]
                        .split('-')[0]
                    }
                    onChange={handleTimeChange}
                    className="w-1/2 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              {/* Use The Coordinate Form Component */}
              <CoordinateForm
                editedImage={editedImage}
                setEditedImage={setEditedImage}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={submitEditedImage}
              >
                Save
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => cancelEditImage()}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <h2>Upload Images</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" required></textarea>
        </div>
        <div>
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
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
