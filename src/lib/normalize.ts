/* Normalize values */

export function getTimeAgo(timestamp: number) {
  const currentDate = new Date();
  const previousDate = new Date(timestamp * 1000); // convert to milliseconds
  const millisecondsPerHour = 60 * 60 * 1000;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  // NOTE: If we want less granularity than days
  // const millisecondsPerWeek = 7 * millisecondsPerDay;
  // const millisecondsPerMonth = 30.44 * millisecondsPerDay;

  const timeDiff = currentDate.getTime() - previousDate.getTime();
  const hoursAgo = Math.floor(timeDiff / millisecondsPerHour);
  const daysAgo = Math.floor(timeDiff / millisecondsPerDay);
  // NOTE: If we want less granularity than days
  // const weeksAgo = Math.floor(timeDiff / millisecondsPerWeek);
  // const monthsAgo = Math.floor(timeDiff / millisecondsPerMonth);

  // TODO: More granularity for minutes!

  if (hoursAgo < 24) {
    return hoursAgo == 1 ? `${hoursAgo} hour ago`: `${hoursAgo} hours ago`;
  }

  return daysAgo == 1 ? `${daysAgo} day ago`: `${daysAgo} days ago`;
}

// Convert timestamp into string in the format of "Month Day, Year"
export function formatDate(timestamp: number) {
  // Convert timestamp to milliseconds
  const milliseconds = timestamp * 1000;

  // Create a new Date object from the milliseconds
  const dateObject = new Date(milliseconds);

  // Get the year, month, and day components from the date object
  const year = dateObject.getFullYear();
  const month = dateObject.toLocaleString('default', { month: 'long' });
  const day = dateObject.getDate();

  const dateString = `${month} ${day}, ${year}`;

  // Return the formatted string
  return dateString;
}