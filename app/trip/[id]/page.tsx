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

interface Image {
  id: string;
  image_path: string;
  date: string;
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
}

interface Path {
  id: number;
  kml_file: string;
}

const fetchTrip = async (): Promise<Trip> => {
  // Pretend API call
  return {
    id: 1,
    name: 'Trip to Paris',
    description: 'A wonderful trip to Paris.',
    start_date: '2023-10-01',
    end_date: '2023-10-10',
    images: [
      {
        //random uuid
        id: '1',
        image_path: 'path/to/image1.jpg',
        date: '2023-10-01',
        long: 2.3522,
        lat: 48.8566,
      },
      {
        id: '231231245-12312312-51231',
        image_path: 'path/to/image2.jpg',
        date: '2023-10-02',
        long: 2.4,
        lat: 48.9,
      },
      // Add more images as needed
    ],
  };
};

export default function Page() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  //populated on loading
  const [trip, setTrip] = useState<Trip | null>(null);

  // Where the Image Selection Is Stored
  const [currentDay, setCurrentDay] = useState<string | null>(null);

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
      .filter((i) => i.date === currentDay)
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
  useEffect(() => {
    const getTrip = async () => {
      const tripData = await fetchTrip();
      setTrip(tripData);
      setCurrentDay(tripData.start_date);

      const trip = tripData;
      //find center of trip through the images
      const total_lat = trip.images.reduce((acc, image) => acc + image.lat, 0);
      const total_long = trip.images.reduce(
        (acc, image) => acc + image.long,
        0
      );

      const center_lat = total_lat / trip.images.length;
      const center_long = total_long / trip.images.length;

      // set the center of the map to the center of the trip
    };

    getTrip();
  }, []);

  // This is necessary to render the map
  // the reason you need mapInstanceRef is because the map
  // will render twice because
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: imageVectorSource.current,
          }),
        ],
        view: new View({
          center: fromLonLat([2.3522, 48.8566]),
          zoom: 4,
        }),
      });
    }
  }, []);

  useEffect(() => {
    if (trip && currentDay) {
      const imagesForDay = trip.images.filter(
        (image) => image.date === currentDay
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
      if (newDateString >= trip.start_date && newDateString <= trip.end_date) {
        setCurrentDay(newDateString);
      }
      setSelectedImage(null);

      //find center of trip through the images for that day
      const total_lat = trip.images
        .filter((image) => image.date === newDateString)
        .reduce((acc, image) => acc + image.lat, 0);

      const total_long = trip.images
        .filter((image) => image.date === newDateString)
        .reduce((acc, image) => acc + image.long, 0);

      const center_lat =
        total_lat /
        trip.images.filter((image) => image.date === newDateString).length;
      const center_long =
        total_long /
        trip.images.filter((image) => image.date === newDateString).length;

      // set the center of the map to the center of the trip
      mapInstanceRef.current
        ?.getView()
        .setCenter(fromLonLat([center_long, center_lat]));

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
            radius: 7,
            fill: new Fill({ color: 'red' }),
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
          .filter((i, v) => currentDay === i.date)
          .map((image) => (
            <img
              key={image.id}
              src={image.image_path}
              alt={`Image for ${image.date}`}
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
    </div>
  );
}
