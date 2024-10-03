/**

These functions will aim to provide a consisten view

This application does NOT care about timestamps,

so everything should just be converted to UTC times


*/

//this function takes in a date string and returns a date

const dateFromString = (dateString: string): Date => {
  // This should parse the date into a time-zone agnostic
  // so if 2012-01-01 is passed in , no matter what time zone the viewer is in
  // the time should be 2012-01-01

  const [year, month, day] = dateString.split('-').map((x) => parseInt(x));

  return new Date(year, month - 1, day);
};

// This function will take in a timestamp string and return a date
const timeFromString = (timeString: string | Date): Date => {
  // This should parse the time into a time-zone agnostic
  // so if 2012-01-01T12:00:00 is passed in , no matter what time zone the viewer is in
  // the time should be 2012-01-01T12:00:00


  //check if the type is a Date
  if (timeString instanceof Object) {
    //extrapolate the time values, such as hours, minutes, seconds , year, month, day
    const hours = timeString.getHours();
    const minutes = timeString.getMinutes();
    const seconds = timeString.getSeconds();
    const year = timeString.getFullYear();
    const month = timeString.getMonth();
    const day = timeString.getDate();

    //get the current time zone offset
    const offset = timeString.getTimezoneOffset();

    //add the offset to the time
    const new_time = new Date(year, month, day, hours, minutes, seconds);
    //add the offset to the time
    new_time.setMinutes(new_time.getMinutes() + offset);

    return new_time;
  }



  //test if the timeStrine string matches the regex
  if (!timeString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    //throw new Error('Invalid time string');
    //return epoch
    console.error('Invalid time string');
    return new Date(0);
  }

  const [date, time] = timeString.split('T');

  const [hours, minutes, seconds] = time.split(':').map((x) => parseInt(x));

  return new Date(dateFromString(date).setHours(hours, minutes, seconds));
};

export { dateFromString, timeFromString };
