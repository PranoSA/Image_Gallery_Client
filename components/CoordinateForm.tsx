import React, { useState } from 'react';

type CoordinateFormProps = {
  //Function to set close the form
  closeForm: () => void;

  // Passed Prop
  startingImage: EditedImage;

  //Function to Change the editedImage
  setEditedImage: (image: EditedImage) => void;
};

type DegreesMinutesSeconds = {
  degrees: number;
  minutes: number;
  seconds: number;
};

const CoordinateForm: React.FC<CoordinateFormProps> = () => {
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

  return (
    <div>
      <h1>Coordinate Form</h1>
    </div>
  );
};
