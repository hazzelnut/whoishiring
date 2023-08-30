/* Normalize values */

export function formatDate(date: Date) {
  date = new Date(date)
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getTimeAgo (date: Date) {
  const old = new Date(date);
  const now = new Date();

  const diff = Math.abs(now.valueOf() - old.valueOf());
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}