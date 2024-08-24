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

  /**
   *
   * Used To Track Changes to the Form When Editing Degrees/Minutes/Seconds
   */
  const [degreesMinutesSecondsLat, setDegreesMinutesSecondsLat] =
    useState<DegreesMinutesSeconds>({
      degrees: 0,
      minutes: 0,
      seconds: 0,
    });

  const [degreesMinutesSecondsLong, setDegreesMinutesSecondsLong] =
    useState<DegreesMinutesSeconds>({
      degrees: 0,
      minutes: 0,
      seconds: 0,
    });

  /**
   *
   *  Used To Bubble Up Changes to the Edited Image
   * In The Case of the User Changing the Degrees/Minutes/Seconds
   */

  const changeToDecimal = () => {
    const decimalDegreesLong =
      degreesMinutesSecondsLong.degrees +
      degreesMinutesSecondsLong.minutes / 60 +
      degreesMinutesSecondsLong.seconds / 3600;

    if (!editedImage) return;

    if (WorE === 'W') {
      setEditedImage({
        ...editedImage,
        long: `-${decimalDegreesLong}`,
      });
      setLocalLong(`-${decimalDegreesLong}`);
    }

    if (WorE === 'E') {
      setEditedImage({
        ...editedImage,
        long: `${decimalDegreesLong}`,
      });
      setLocalLong(`${decimalDegreesLong}`);
    }

    const decimalDegreesLat =
      degreesMinutesSecondsLat.degrees +
      degreesMinutesSecondsLat.minutes / 60 +
      degreesMinutesSecondsLat.seconds / 3600;

    if (Nors === 'N') {
      setEditedImage({
        ...editedImage,
        lat: `${decimalDegreesLat}`,
      });
      setLocalLat(`${decimalDegreesLat}`);
    }

    if (Nors === 'S') {
      setEditedImage({
        ...editedImage,
        lat: `-${decimalDegreesLat}`,
      });
      setLocalLat(`-${decimalDegreesLat}`);
    }
  };

  const changeDecimalToDegrees = () => {
    if (!editedImage) return;

    let long = parseFloat(editedImage.long);

    let lat = parseFloat(editedImage.lat);

    //first, test if N or S
    const Nors = lat >= 0 ? 'N' : 'S';
    setNors(Nors);

    //if South, make positive
    long = long < 0 ? -long : long;

    //first, test if E or W
    const WorE = long >= 0 ? 'E' : 'W';
    setWorE(WorE);

    //if West, make positive
    lat = lat < 0 ? -lat : lat;

    const long_deg = Math.floor(Math.abs(long));

    const long_min = Math.floor((Math.abs(long) - long_deg) * 60);

    const long_sec = ((Math.abs(long) - long_deg) * 60 - long_min) * 60;

    const lat_deg = Math.floor(Math.abs(lat));

    const lat_min = Math.floor((Math.abs(lat) - lat_deg) * 60);

    const lat_sec = ((Math.abs(lat) - lat_deg) * 60 - lat_min) * 60;

    setDegreesMinutesSecondsLong({
      degrees: long_deg,
      minutes: long_min,
      seconds: long_sec,
    });

    setDegreesMinutesSecondsLat({
      degrees: lat_deg,
      minutes: lat_min,
      seconds: lat_sec,
    });
  };

  //what is the input html event called again?

  //Not Sure if this part is necessary as its part of the props
  /*

*/

  const [googleInput, setGoogleInput] = useState<string>('');

  const previousSetting = useRef<'decimal' | 'minutes' | 'google'>('decimal');

  useEffect(() => {
    setCoordinateOption(previousSetting.current);
  }, [editedImage]);

  const setFromGoogleCoordinates = () => {
    previousSetting.current = coordinateOption;
    setCoordinateOption('google');
    //format 34°18'06.7"N 119°18'06.7"W
    const regex =
      /(\d+)°(\d+)'(\d+\.\d+)"([N|S|E|W]) (\d+)°(\d+)'(\d+\.\d+)"([N|S|E|W])/g;

    if (!editedImage) return;

    //find long in degrees
    const input = googleInput;

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

      setDegreesMinutesSecondsLat({
        degrees: degrees_lat,
        minutes: minutes_lat,
        seconds: seconds_lat,
      });

      setDegreesMinutesSecondsLong({
        degrees: degrees_long,
        minutes: minutes_long,
        seconds: seconds_long,
      });

      //change to degrees
      changeToDecimal();

      setNors(Nors);
      setWorE(WorE);

      //set degrees
      //make sure its in
    }

    //test format
  };

  //Let this be associated With Degrees/Minutes/Seconds
  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //check if long or lat

    //check if last change was in minutes
    if (coordinateOption !== 'minutes') return;

    const local_image_test = { ...editedImage };

    if (!editedImage) return;

    const field = e.target.name;

    if (degreesInMinutes) {
      // test if format like "34°18'06.7"N"
      //parse and set

      //test first
      const regex = /(\d+)°(\d+)'(\d+\.\d+)"([N|S|E|W])/g;

      if (regex.test(e.target.value)) {
        //break out of if, not the function

        const degrees = parseInt(RegExp.$1);
        const minutes = parseInt(RegExp.$2);
        const seconds = parseFloat(RegExp.$3);
        const direction = RegExp.$4;

        if (field === 'long') {
          setDegreesMinutesSecondsLong({
            degrees,
            minutes,
            seconds,
          });
        }

        if (field === 'lat') {
          setDegreesMinutesSecondsLat({
            degrees,
            minutes,
            seconds,
          });
        }
      }
    }

    if (field === 'long') {
      if (degreesInMinutes) {
        //convert to decimal degrees
        //
        const [degrees, minutes, seconds] = e.target.value.split(' ');
        const decimalDegrees = parseFloat(degrees) + parseFloat(minutes) / 60;
        setEditedImage({
          ...editedImage,
          long: decimalDegrees.toString(),
        });
      } else {
        setEditedImage({
          ...editedImage,
          long: e.target.value,
        });
      }
    }

    if (field === 'lat') {
      if (degreesInMinutes) {
        //convert to decimal degrees
        const [degrees, minutes] = e.target.value.split(' ');
        const decimalDegrees = parseFloat(degrees) + parseFloat(minutes) / 60;
        setEditedImage({
          ...editedImage,
          lat: decimalDegrees.toString(),
        });
      } else {
        setEditedImage({
          ...editedImage,
          lat: e.target.value,
        });
      }
    }
  };

  const [localLat, setLocalLat] = useState<string>(editedImage?.lat || '');
  const [localLong, setLocalLong] = useState<string>(editedImage?.long || '');

  useEffect(() => {
    if (editedImage) {
      changeDecimalToDegrees();
    }
  }, []);

  useEffect(() => {
    if (coordinateOption === 'google') {
      changeToDecimal();
    }
  }, [editedImage]);

  const handleEditedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //check if long or lat
    if (!editedImage) return;

    if (coordinateOption !== 'decimal') return;

    const field = e.target.name;

    if (field === 'long') {
      setLocalLong(e.target.value);

      setEditedImage({
        ...editedImage,
        long: e.target.value,
      });

      //change the degrees/minutes/seconds
      changeDecimalToDegrees();
    }

    if (field === 'lat') {
      if (degreesInMinutes) {
        setLocalLat(e.target.value);

        setEditedImage({
          ...editedImage,
          lat: e.target.value,
        });

        //change the degrees/minutes/seconds
        changeDecimalToDegrees();
      }
    }
  };

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
              changeDecimalToDegrees();
              setCoordinateOption('minutes');
            } else {
              setCoordinateOption('decimal');
              changeToDecimal();
              setCoordinateOption('decimal');
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
          onChange={(e) => setGoogleInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            setFromGoogleCoordinates();
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
              onChange={handleCoordinatesChange}
              value={degreesMinutesSecondsLong.degrees}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="long_min"
              placeholder="Minutes"
              onChange={handleCoordinatesChange}
              value={degreesMinutesSecondsLong.minutes}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="long_sec"
              placeholder="Seconds"
              onChange={handleCoordinatesChange}
              value={degreesMinutesSecondsLong.seconds}
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
              value={degreesMinutesSecondsLat.degrees}
              onChange={handleEditedImageChange}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="lat_min"
              placeholder="Minutes"
              value={degreesMinutesSecondsLat.minutes}
              onChange={handleEditedImageChange}
              disabled={coordinateOption === 'decimal'}
              className={`w-1/3 px-3 py-2 border rounded-lg ${
                coordinateOption === 'decimal' ? 'bg-gray-200' : ''
              }`}
            />
            <input
              type="text"
              name="lat_sec"
              placeholder="Seconds"
              value={degreesMinutesSecondsLat.seconds}
              onChange={handleEditedImageChange}
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
            value={localLat || ''}
            onChange={handleEditedImageChange}
            disabled={coordinateOption === 'minutes'}
            className={`w-full px-3 py-2 border rounded-lg ${
              coordinateOption === 'minutes' ? 'bg-gray-200' : ''
            }`}
          />
          <input
            type="text"
            name="long"
            onChange={handleCoordinatesChange}
            value={localLong || ''}
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
