import Globe from 'globe.gl';
import { CountUp } from 'countup.js';
const globeContainer = document.getElementById('globeViz');
const globeImageUrl =
  '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg';
const backgroundImageUrl =
  '//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png';
let world;

const geojsonUrl =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const apiUrl = 'https://covid2019-api.herokuapp.com/v2/current';

init();

function init() {
  world = Globe()(globeContainer)
    .globeImageUrl(globeImageUrl)
    .backgroundImageUrl(backgroundImageUrl)
    .pointOfView({ altitude: 2.5 }, 5000)
    .polygonCapColor(feat => 'rgba(200, 0, 0, 0.6)')
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.05)')
    .polygonLabel(
      ({ properties: d }) => `
            <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
            Active cases: <i>${d.COVID_ACTIVE_CASES || 0}</i> <br />
            Deaths: <i>${d.COVID_DEATHS || 0}</i> <br />
            Recovered: <i>${d.COVID_RECOVERED || 0}</i>
          `
    );

  // Auto-rotate
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.1;

  getCases();
}

async function getCases() {
  const countries = await request(geojsonUrl);
  const { data } = await request(apiUrl);

  // Change location names based on geojson
  const usIdx = data.findIndex(i => i.location === 'US');
  data[usIdx].location = 'United States of America';
  const skIdx = data.findIndex(i => i.location === 'Korea, South');
  data[skIdx].location = 'South Korea';

  data.forEach(item => {
    const countryIdx = countries.features.findIndex(
      i => i.properties.ADMIN === item.location
    );

    if (countryIdx !== -1) {
      countries.features[countryIdx].properties.COVID_TOTAL_CONFIRMED =
        item.confirmed;
      countries.features[countryIdx].properties.COVID_ACTIVE_CASES =
        item.confirmed - (item.deaths + item.recovered);
      countries.features[countryIdx].properties.COVID_DEATHS = item.deaths;
      countries.features[countryIdx].properties.COVID_RECOVERED =
        item.recovered;
      item.recovered;
    }
  });

  world.polygonsData(countries.features);

  // Show total counts
  const totalInfected = data.reduce((a, b) => a + b.confirmed, 0);
  const infected = new CountUp('infected', totalInfected);
  infected.start();

  const totalDeaths = data.reduce((a, b) => a + b.deaths, 0);
  const deaths = new CountUp('deaths', totalDeaths);
  deaths.start();

  const totalRecovered = data.reduce((a, b) => a + b.recovered, 0);
  const recovered = new CountUp('recovered', totalRecovered);
  recovered.start();

  // Do effect
  setTimeout(
    () =>
      world
        .polygonsTransitionDuration(4000)
        .polygonAltitude(feat =>
          Math.max(
            0.1,
            Math.sqrt(+feat.properties.COVID_TOTAL_CONFIRMED) * 7e-5
          )
        ),
    3000
  );
}

async function request(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (e) {
    throw e;
  }
}
