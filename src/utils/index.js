import dayjs from 'dayjs';

export async function request(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (e) {
    throw e;
  }
}

export async function getCoordinates() {
  try {
    const { latitude, longitude } = await request(
      'https://geolocation-db.com/json/'
    );

    return {
      latitude,
      longitude,
    };
  } catch (e) {
    throw e;
  }
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(date, format = 'MMMM D, YYYY') {
  return dayjs(date).format(format);
}
