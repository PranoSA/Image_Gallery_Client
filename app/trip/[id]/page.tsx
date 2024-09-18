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

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { Banner_Component } from '@/components/Trip_View/Banner_Component';

import PathLegend from '@/components/PathLegend';

import axios from 'axios';
import NextImage from 'next/image';
import Modal from '@/components/PathModal';

import { KML } from 'ol/format';
import { HiOutlinePencil } from 'react-icons/hi';

import type { Image, Path, Trip } from '@/definitions/Trip_View';

import {
  useQueryTripPaths,
  useQueryTrip,
  useQueryTripImages,
} from '@/components/Trip_View/Trip_View_Image_Store';

import PathMapModal from '@/components/PathMapModal';

import {
  useTripViewStore,
  tripViewStore,
} from '@/components/Trip_View/Trip_View_Image_Store';
import { Image_View_ByDate } from '@/components/Trip_View/Date_View/Image_View_ByDate';

//process.env.NEXT_PUBLIC_API_URL

export default function Page({ params: { id } }: { params: { id: string } }) {
  useEffect(() => {
    tripViewStore.setState((prevState) => ({
      ...prevState,
      selected_trip_id: id,
    }));
  }, [id]);

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQueryTrip(id);

  // with trip paths
  const {
    data: paths,
    isLoading: pathsLoading,
    error: pathsError,
  } = useQueryTripPaths(id);

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQueryTripImages(id);

  const { selected_date, get_images_for_day, selected_image_location } =
    useTripViewStore();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //populated on loading
  //const [trip, setTrip] = useState<Trip | null>(null);

  const [pathModalOpen, setPathModalOpen] = useState(false);

  const currentDay = () => {
    const startDate = new Date(trip.start_date);
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + selected_date);

    return selectedDate.toISOString().split('T')[0];
  };

  const [comparingPhotos, setComparingPhotos] = useState<boolean>(false);

  const [menu, showMenu] = useState<boolean>(false);

  // map to find the path id from the feature
  const pathFromFeature = useRef<Map>(new Map());

  useEffect(() => {
    if (!selected_date || !trip || !paths) return;
    const currentDayDate = new Date(trip.start_date);
    currentDayDate.setDate(currentDayDate.getDate() + selected_date);

    const currentDay = currentDayDate.toISOString().split('T')[0];
    if (!currentDay) return;

    const fetchKMLFiles = async () => {
      const filteredPaths = paths.filter(
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
  }, [selected_date, trip, paths]);

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

      //@ts-ignore
      const featureId = feature.ol_uid || feature.getId();

      //get the path id from the feature
      const pathId = pathFromFeature.current.get(featureId);

      //find it in the trip.paths
      if (!paths) return;
      const path = paths.find((p) => p.id === pathId);

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
    if (!images || !currentDay) return;

    images
      .filter((i) => i.created_at.split('T')[0] === currentDay())
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
          zoom: 2,
        }),
      });
    }
  }, [mapRef.current]);

  //set center of view when the selected date changes
  useEffect(() => {
    if (!trip || !currentDay) return;

    const startDate = new Date(trip.start_date);
    const selectedDate = new Date(startDate);
    selectedDate.setDate(startDate.getDate() + selected_date);

    //get images for the day
    const imagesForDay = get_images_for_day(
      selected_date,
      trip.start_date,
      images || []
    );

    if (imagesForDay.length > 0) {
      //set center of view to the center of the images
      const candidateImages = imagesForDay
        .filter((image) => image.lat && image.long)
        .filter(
          (image) => parseFloat(image.lat) !== 0 && parseFloat(image.long) !== 0
        );

      const total_lat = candidateImages.reduce(
        (acc, image) => acc + parseFloat(image.lat),
        0
      );

      const total_long = candidateImages.reduce(
        (acc, image) => acc + parseFloat(image.long),
        0
      );

      //set the center of the map to the center of the trip
      mapInstanceRef.current
        ?.getView()
        .setCenter(
          fromLonLat([
            total_long / candidateImages.length,
            total_lat / candidateImages.length,
          ])
        );

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

    // change heat map layer
    if (imageHeatMapLayer.current) {
      mapInstanceRef.current?.removeLayer(imageHeatMapLayer.current);
    }
  }, [selected_date, trip]);

  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  useEffect(() => {
    console.log('selectedImages', selectedImages);
  }, [selectedImages]);

  useEffect(() => {
    if (!selected_image_location) return;

    if (selectedFeature.current?.get('id') === selected_image_location.id) {
      imageVectorSource.current.removeFeature(selectedFeature.current);
      //setSelectedImageLocation(null);
      selectedFeature.current = null;
    } else {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat([
            parseFloat(selected_image_location.long),
            parseFloat(selected_image_location.lat),
          ])
        ),
        ol_uid: selected_image_location.id,
        id: selected_image_location.id,
        Id: selected_image_location.id,
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
      // Remove old feature
      if (selectedFeature.current) {
        imageVectorSource.current.removeFeature(selectedFeature.current);
      }
      selectedFeature.current = feature;
      imageVectorSource.current.addFeature(feature);
    }
  }, [selected_image_location]);

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

  /**
   *
  This is for fields like name, description, created_at

   */

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
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    };

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
    (images &&
      images
        .filter((i) => i.created_at.split('T')[0] === currentDay())
        .sort((a, b) => a.created_at.localeCompare(b.created_at))) ||
    [];

  if (comparingPhotos) {
    // Have the Image Gallery for that day instead of the map
    // select the images to compare
    // then click a "done button"
    // this sets doneSelectedImages to true
    return (
      <div className="">
        <div className="gallery mt-4">
          {imagesForDay.map((image: Image) => (
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

  const toggleMenu = () => {
    showMenu(!menu);
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
      {Banner_Component({})}
      <div className="flex justify-center items-center">
        <div
          ref={mapRef}
          style={{ width: '100%', height: '50vh' }}
          className="w-full relative "
        >
          <PathLegend
            paths={
              selected_date && trip
                ? (paths &&
                    paths.filter(
                      (path) =>
                        path.start_date <= currentDay() &&
                        path.end_date >= currentDay()
                    )) ||
                  []
                : []
            }
          />
        </div>
      </div>
      {Image_View_ByDate({})}

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
