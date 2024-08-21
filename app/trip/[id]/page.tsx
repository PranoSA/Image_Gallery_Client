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

import axios from 'axios';
import Image from 'next/image';
import Modal from '@/components/Modal';

import { KML } from 'ol/format';

interface Image {
  id: string;
  file_path: string;
  created_at: string;
  long: number;
  lat: number;
  ol_id?: string;
}

interface Trip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  images: Image[];
  paths: Path[];
}

interface Path {
  id: number;
  kml_file: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  color_g: number;
  color_b: number;
  color_r: number;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
}

//process.env.NEXT_PUBLIC_API_URL

export default function Page({ params: { id } }: { params: { id: string } }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //populated on loading
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kml_paths, setkmlPaths] = useState<Path[]>([]);

  //useSearchParam is a hook that allows you to get the search params from the URL

  const params = useSearchParams();

  const [path, setPath] = useState<Path | null>(null);

  const [pathModalOpen, setPathModalOpen] = useState(false);

  // Where the Image Selection Is Stored
  const [currentDay, setCurrentDay] = useState<string | null>(null);

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

          // Apply styles
          const style = new Style({
            stroke: new Stroke({
              width: 5,
              color: [path.color_r, path.color_g, path.color_b, 1], // RGBA array
              width: path.thickness,
              lineDash:
                path.style === 'dashed'
                  ? [4, 8]
                  : path.style === 'dotted'
                  ? [1, 4]
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
          geometry: new Point(fromLonLat([image.long, image.lat])),
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
        trip.images.filter((image) => image.created_at === newDateString)
          .length > 0
      ) {
        const total_lat = trip.images
          .filter((image) => image.created_at === newDateString)
          .reduce((acc, image) => acc + image.lat, 0);

        const total_long = trip.images
          .filter((image) => image.created_at === newDateString)
          .reduce((acc, image) => acc + image.long, 0);

        const center_lat =
          total_lat /
          trip.images.filter((image) => image.created_at === newDateString)
            .length;
        const center_long =
          total_long /
          trip.images.filter((image) => image.created_at === newDateString)
            .length;

        // set the center of the map to the center of the trip
        mapInstanceRef.current
          ?.getView()
          .setCenter(fromLonLat([center_long, center_lat]));
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

  const handleImageClick = (image: Image) => {
    console.log(selectedFeature.current);
    // console log ids
    console.log(selectedFeature.current?.getId());
    console.log(selectedFeature.current?.get('ol_uid'));
    console.log(selectedFeature.current?.get('id'));
    if (selectedFeature && selectedFeature.current?.get('id') === image.id) {
      imageVectorSource.current.removeFeature(selectedFeature.current);
      setSelectedImage(null);
      selectedFeature.current = null;
    } else {
      const feature = new Feature({
        geometry: new Point(fromLonLat([image.long, image.lat])),
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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

  return (
    <div>
      <Modal
        isOpen={pathModalOpen}
        onClose={() => setPathModalOpen(!pathModalOpen)}
        onSubmit={submitModal}
      />
      <div className="flex justify-around items-center mb-4">
        <button
          onClick={() => handleDayChange('prev')}
          disabled={currentDay === trip?.start_date}
        >
          {'<'}
        </button>
        <span>Day {currentDay}</span>
        <button
          onClick={() => handleDayChange('next')}
          disabled={currentDay === trip?.end_date}
        >
          {'>'}
        </button>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '50vh' }}></div>
      <div className="gallery mt-4">
        {trip?.images
          .filter((i, v) => currentDay === i.created_at.split('T')[0])
          .map((image) => (
            <img
              key={image.id}
              src={`${process.env.NEXT_PUBLIC_STATIC_IMAGE_URL}/${image.file_path}`}
              alt={`Image for ${image.created_at}`}
              onClick={() => handleImageClick(image)}
              style={{
                cursor: 'pointer',
                margin: '10px',
                width: '100px',
                height: '100px',
                border:
                  selectedImage && selectedImage.id === image.id
                    ? '3px solid blue'
                    : 'none',
              }}
            />
          ))}
      </div>
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
