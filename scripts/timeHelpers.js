export function getTimeStamp (dateData) {
  if (!dateData) return;

  const date = new Date(dateData);
  return [date.getHours(), date.getMinutes()]
    .map(n => n.toString())
    .map(s => s.padStart(2, '0'))
    .join(':');
}

export function getDateStamp (dateData) {
  if (!dateData) return;

  const date = new Date(dateData);
  return [date.getDate(), date.getMonth() + 1]
    .join('/');
}

export function getDurationStamp (timeData) {
  if (!timeData) return;

  const minute = 60 * 1000;
  const hour = 60 * minute;

  const hours = Math.floor(timeData / hour);
  const minutes = Math.floor((timeData - hours * hour) / minute);
  return `${hours} h ${minutes} min`;
}
