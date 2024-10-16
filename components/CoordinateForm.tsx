import React, { useEffect, useRef, useState } from 'react';

import { Image } from '@/definitions/Trip_View';

type CoordinateFormProps = {
  //Function to set close the form

  // Passed Prop
  editedImage: Image | null;

  //Function to Change the editedImage
  setEditedImage: (image: Image) => void;
};

type DegreesMinutesSeconds = {
  degrees: number;
  minutes: number;
  seconds: number;
};

const CoordinateForm: React.FC<CoordinateFormProps> = ({
  setEditedImage,
  editedImage,
}) => {
  const [WorE, setWorE] = useState<'W' | 'E'>('W');
  const [Nors, setNors] = useState<'N' | 'S'>('N');

  //last editing
  const [coordinateOption, setCoordinateOption] = useState<
    'decimal' | 'minutes' | 'google'
  >('decimal');

  const [degreesInMinutes, setDegreesInMinutes] = useState<boolean>(false);

  // Update the editatedImage based on the google inut
  const setFromGoogleCoordinates = (value_string: string) => {
    //format 34°18'06.7"N 119°18'06.7"W
    //52°15'0.0"N 21°0'42.0"E

    //49°58′45″N 20°3′50″E﻿ / ﻿49.97917°N 20.06389°E
    //49°58′45″N 20°3′50″E -> Why is this giving me an error?

    //49°58′45″N 20°3′50″E
    const regex_2 =
      /(\d+)°(\d+)[′'](\d+(\.\d+)?)["″]([NSEW]) (\d+)°(\d+)[′'](\d+(\.\d+)?)["″]([NSEW])/g;

    const regex =
      /(\d+)°(\d+)'(\d+(\.\d+)?)"([N|S|E|W]) (\d+)°(\d+)'(\d+(\.\d+)?)"([N|S|E|W])/g;

    if (!editedImage) {
      console.error('No Image');
      return;
    }
    //find long in degrees
    const input = value_string;

    if (regex.test(input)) {
      // split the input into two parts
      const [lat, long] = input.split(' ');

      //test if N or S
      const Nors = lat.includes('N') ? 'N' : 'S';

      const degrees_lat = parseInt(lat.split('°')[0]);

      const minutes_lat = parseInt(lat.split('°')[1].split("'")[0]);

      const seconds_lat = parseFloat(lat.split("'")[1].split('"')[0]);

      //test if E or W
      const WorE = long.includes('E') ? 'E' : 'W';

      const degrees_long = parseInt(long.split('°')[0]);

      const minutes_long = parseInt(long.split('°')[1].split("'")[0]);

      const seconds_long = parseFloat(long.split("'")[1].split('"')[0]);

      //get decimal degrees long and lat
      const decimalDegreesLong =
        degrees_long +
        minutes_long / 60 +
        (seconds_long / 3600) * (WorE === 'W' ? -1 : 1);

      const decimalDegreesLat =
        degrees_lat +
        minutes_lat / 60 +
        (seconds_lat / 3600) * (Nors === 'S' ? -1 : 1);

      setEditedImage({
        ...editedImage,
        lat: `${decimalDegreesLat}`,
        long: `${decimalDegreesLong}`,
      });

      //make sure its in
    }
    //test if it passes the second regex
    if (regex_2.test(input)) {
      // split the input into two parts
      const [lat, long] = input.split(' ');

      //test if N or S
      const Nors = lat.includes('N') ? 'N' : 'S';

      const degrees_lat = parseInt(lat.split('°')[0]);

      const minutes_lat = parseInt(lat.split('°')[1].split('′')[0]);

      const seconds_lat = parseFloat(lat.split('′')[1].split('″')[0]);

      //test if E or W
      const WorE = long.includes('E') ? 'E' : 'W';

      const degrees_long = parseInt(long.split('°')[0]);

      const minutes_long = parseInt(long.split('°')[1].split('′')[0]);

      const seconds_long = parseFloat(long.split('′')[1].split('″')[0]);

      //get decimal degrees long and lat
      const decimalDegreesLong =
        degrees_long +
        minutes_long / 60 +
        (seconds_long / 3600) * (WorE === 'W' ? -1 : 1);

      const decimalDegreesLat =
        degrees_lat +
        minutes_lat / 60 +
        (seconds_lat / 3600) * (Nors === 'S' ? -1 : 1);

      setEditedImage({
        ...editedImage,
        lat: `${decimalDegreesLat}`,
        long: `${decimalDegreesLong}`,
      });
    }
    //test format
  };

  /**
   * Converts the editedImage data to a google coordinates string
   */
  const googleCoordinatesFromValue = (): string => {
    //format 34°18'06.7"N 119°18'06.7"W

    const degrees_lat = Math.floor(
      Math.abs(parseFloat(editedImage?.lat || '0'))
    );
    const lat_direction =
      Math.sign(parseFloat(editedImage?.lat || '0')) === 1 ? 'N' : 'S';

    const minutes_lat = Math.floor(
      (Math.abs(parseFloat(editedImage?.lat || '0')) - degrees_lat) * 60
    );
    const seconds_lat = Math.floor(
      ((Math.abs(parseFloat(editedImage?.lat || '0')) - degrees_lat) * 60 -
        minutes_lat) *
        60
    );

    const degrees_long = Math.floor(
      Math.abs(parseFloat(editedImage?.long || '0'))
    );

    const long_direction =
      Math.sign(parseFloat(editedImage?.long || '0')) === 1 ? 'E' : 'W';

    const minutes_long = Math.floor(
      (Math.abs(parseFloat(editedImage?.long || '0')) - degrees_long) * 60
    );

    const seconds_long = Math.floor(
      ((Math.abs(parseFloat(editedImage?.long || '0')) - degrees_long) * 60 -
        minutes_long) *
        60
    );

    return `${degrees_lat}°${minutes_lat}'${seconds_lat}"${lat_direction} ${degrees_long}°${minutes_long}'${seconds_long}"${long_direction}`;
  };

  const setFromLat = (value: string) => {
    if (!editedImage) return;

    setEditedImage({
      ...editedImage,
      lat: value,
    });
  };

  const latFromValue = (): string => {
    return editedImage?.lat || '';
  };

  const setFromLong = (value: string) => {
    if (!editedImage) return;

    setEditedImage({
      ...editedImage,
      long: value,
    });
  };

  const longFromValue = (): string => {
    return editedImage?.long || '';
  };

  /**
   *
   */

  /**
   *
   * @param value
   *
   * Utility Functions
   * @returns
   */

  const old_degrees = (value: string): number => {
    const abs = Math.abs(parseFloat(value));
    return Math.floor(abs);
  };

  const old_minutes = (value: string): number => {
    const abs = Math.abs(parseFloat(value));
    return Math.floor((abs - Math.floor(abs)) * 60);
  };

  const old_seconds = (value: string): number => {
    const abs = Math.abs(parseFloat(value));
    return Math.floor(((abs - Math.floor(abs)) * 60 - old_minutes(value)) * 60);
  };

  const new_from_degres_minutes_seconds = (
    degrees: number,
    minutes: number,
    seconds: number
  ): number => {
    return degrees + minutes / 60 + seconds / 3600;
  };

  const setFromLatDegrees = (value: string) => {
    // set only the degrees
    if (!editedImage) return;

    const old_lat_degrees = old_degrees(editedImage.lat || '0');

    const old_lat_minutes = old_minutes(editedImage.lat || '0');

    const old_lat_seconds = old_seconds(editedImage.lat || '0');

    const lat =
      new_from_degres_minutes_seconds(
        parseInt(value),
        old_lat_minutes,
        old_lat_seconds
      ) * (Nors === 'S' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      lat: `${lat}`,
    });
  };

  const latDegreesFromValue = (): string => {
    const lat = old_degrees(editedImage?.lat || '0');
    return `${lat}`;
  };

  const setFromLongDegrees = (value: string) => {
    // set only the degrees
    if (!editedImage) return;

    const old_long_degrees = old_degrees(editedImage.long || '0');

    const old_long_minutes = old_minutes(editedImage.long || '0');

    const old_long_seconds = old_seconds(editedImage.long || '0');

    const long =
      new_from_degres_minutes_seconds(
        parseInt(value),
        old_long_minutes,
        old_long_seconds
      ) * (WorE === 'W' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      long: `${long}`,
    });
  };

  const longDegreesFromValue = (): string => {
    const long = old_degrees(editedImage?.long || '0');
    return `${long}`;
  };

  const setFromLatMinutes = (value: string) => {
    if (!editedImage) return;

    const old_lat_mnutes = old_minutes(editedImage.lat || '0');

    const old_lat_degrees = old_degrees(editedImage.lat || '0');

    const old_lat_seconds = old_seconds(editedImage.lat || '0');

    const lat =
      new_from_degres_minutes_seconds(
        old_lat_degrees,
        parseInt(value),
        old_lat_seconds
      ) * (Nors === 'S' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      lat: `${lat}`,
    });
  };

  const latMinutesFromValue = (): string => {
    const lat = old_minutes(editedImage?.lat || '0');
    return `${lat}`;
  };

  const setFromLongMinutes = (value: string) => {
    if (!editedImage) return;

    const old_long_mnutes = old_minutes(editedImage.long || '0');
    const old_long_degrees = old_degrees(editedImage.long || '0');
    const old_long_seconds = old_seconds(editedImage.long || '0');

    const long =
      new_from_degres_minutes_seconds(
        old_long_degrees,
        parseInt(value),
        old_long_seconds
      ) * (WorE === 'W' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      long: `${long}`,
    });
  };

  const longMinutesFromValue = (): string => {
    const long = old_minutes(editedImage?.long || '0');
    return `${long}`;
  };

  const setFromLatSeconds = (value: string) => {
    if (!editedImage) return;

    const old_lat_seconds = old_seconds(editedImage.lat || '0');
    const old_lat_degrees = old_degrees(editedImage.lat || '0');
    const old_lat_minutes = old_minutes(editedImage.lat || '0');

    const lat =
      new_from_degres_minutes_seconds(
        old_lat_degrees,
        old_lat_minutes,
        parseInt(value)
      ) * (Nors === 'S' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      lat: `${lat}`,
    });
  };

  const latSecondsFromValue = (): string => {
    const lat = old_seconds(editedImage?.lat || '0');
    return `${lat}`;
  };

  const setFromLongSeconds = (value: string) => {
    if (!editedImage) return;

    // old lat minutes is
    const old_long_seconds = old_seconds(editedImage.long || '0');

    const old_long_degrees = old_degrees(editedImage.long || '0');

    const old_long_minutes = old_minutes(editedImage.long || '0');

    const long =
      new_from_degres_minutes_seconds(
        old_long_degrees,
        old_long_minutes,
        parseInt(value)
      ) * (WorE === 'W' ? -1 : 1);

    setEditedImage({
      ...editedImage,
      long: `${long}`,
    });
  };

  const longSecondsFromValue = (): string => {
    const long = old_seconds(editedImage?.long || '0');
    return `${long}`;
  };

  //what is the input html event called again?

  //Not Sure if this part is necessary as its part of the props
  /*

*/

  const [googleInput, setGoogleInput] = useState<string>('');
  const [googleSubmitInput, setGoogleSubmitInput] = useState<string>('');

  const previousSetting = useRef<'decimal' | 'minutes' | 'google'>('decimal');

  return (
    <div>
      {/* Select decimals or minutes */}
      <div className="mb-4">
        <label className="block text-gray-700">Degrees or Minutes</label>
        <select
          name="degreesInMinutes"
          value={degreesInMinutes ? 'minutes' : 'decimal'}
          onChange={(e) => {
            setDegreesInMinutes(e.target.value === 'minutes');
            if (e.target.value === 'minutes') {
              setCoordinateOption('minutes');
              previousSetting.current = 'minutes';
            } else {
              setCoordinateOption('decimal');
              previousSetting.current = 'decimal';
            }
          }}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="decimal">Decimal</option>
          <option value="minutes">Minutes/Seconds</option>
        </select>

        {/* Text Box and Submit Button For Entering Google Coordinates*/}
        <input
          type="text"
          name="google_coordinates"
          placeholder="'34°18'06.7'N 119°18'06.7'W"
          onChange={(e) => setFromGoogleCoordinates(e.target.value)}
          value={googleCoordinatesFromValue()}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            //set setting to google
            setCoordinateOption('google');
            setGoogleSubmitInput(googleInput);
            setCoordinateOption(previousSetting.current);
            //setFromGoogleCoordinates();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Set From Google Coordinates
        </button>

        {/* If In Minutes */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              name="long_deg"
              placeholder="Degrees"
              onChange={(e) => setFromLongDegrees(e.target.value)}
              value={longDegreesFromValue()}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="long_min"
              placeholder="Minutes"
              onChange={(e) => setFromLongMinutes(e.target.value)}
              value={longMinutesFromValue()}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="long_sec"
              placeholder="Seconds"
              onChange={(e) => setFromLongSeconds(e.target.value)}
              value={longSecondsFromValue()}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <select
              value={WorE}
              onChange={(e) => setWorE(e.target.value as 'W' | 'E')}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            >
              <option value="W">W</option>
              <option value="E">E</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="lat_deg"
              placeholder="Degrees"
              value={latDegreesFromValue()}
              onChange={(e) => setFromLatDegrees(e.target.value)}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="lat_min"
              placeholder="Minutes"
              value={latMinutesFromValue()}
              onChange={(e) => setFromLatMinutes(e.target.value)}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="lat_sec"
              placeholder="Seconds"
              value={latSecondsFromValue()}
              onChange={(e) => setFromLatSeconds(e.target.value)}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <select
              value={Nors}
              onChange={(e) => setNors(e.target.value as 'N' | 'S')}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            >
              <option value="N">N</option>
              <option value="S">S</option>
            </select>
          </div>
        </div>

        {/* If Not In Minutes */}
        <div className="mb-4">
          {/* Latitude */}
          <input
            type="text"
            name="lat"
            value={latFromValue()}
            onChange={(e) => {
              setFromLat(e.target.value);
              /*
              if (coordinateOption === 'minutes') return;
              setLocalCoordinates({
                ...localCoordinates,
                lat: e.target.value,
              });
              */
            }}
            disabled={coordinateOption === 'minutes'}
            className={`w-full px-3 py-2 border rounded-lg ${
              coordinateOption === 'minutes' ? 'bg-gray-200' : ''
            }`}
          />
          <input
            type="text"
            name="long"
            onChange={(e) => {
              setFromLong(e.target.value);
              /*if (coordinateOption === 'minutes') return;
              setLocalCoordinates({
                ...localCoordinates,
                long: e.target.value,
              });*/
            }}
            value={longFromValue()}
            disabled={coordinateOption === 'minutes'}
            className={`w-full px-3 py-2 border rounded-lg ${
              coordinateOption === 'minutes' ? 'bg-gray-200' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default CoordinateForm;
