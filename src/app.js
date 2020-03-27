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
const apiUrl = 'https://corona.lmao.ninja/countries?sort=country';

init();

function init() {
  world = Globe()(globeContainer)
    .globeImageUrl(globeImageUrl)
    .backgroundImageUrl(backgroundImageUrl)
    .pointOfView({ altitude: 4.5 }, 5000)
    .polygonCapColor(feat => 'rgba(200, 0, 0, 0.6)')
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.05)')
    .polygonLabel(
      ({ properties: d, covid: c }) => `
            <div class="card">
              <img class="card-img" src="${c.countryInfo.flag}" alt="flag" />
              <div class="container">
                 <span class="card-title"><b>${d.ADMIN}</b></span> <br />
                 <span class="card-total-cases">${c.cases} total cases</span>
                 <div class="card-spacer"></div>
                 <hr />
                 <div class="card-spacer"></div>
                 <span>${c.active} active</span> <br />
                 <span>${c.deaths} dead</span> <br />
                 <span>${c.recovered} recovered</span>
                 <div class="card-spacer"></div>
                 <hr />
                 <div class="card-spacer"></div>
                 <div class="bottom-info">
                  <span style="color: goldenrod;">Today</span>
                  <span>${c.todayCases} cases</span>
                  <span>${c.todayDeaths} deaths</span>
                 </div>
              </div>
            </div>
          `
    );

  // Auto-rotate
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.1;

  getCases();
}

async function getCases() {
  const countries = await request(geojsonUrl);
  const data = await request(apiUrl);

  const countriesWithCovid = []

  data.forEach(item => {
    const countryIdx = countries.features.findIndex(
      i => i.properties.ISO_A2 === item.countryInfo.iso2 && i.properties.ISO_A3 === item.countryInfo.iso3
    );

    const clone = {
      ...countries.features[countryIdx]
    }

    if (countryIdx !== -1) {
      countriesWithCovid.push({
        ...countries.features[countryIdx],
        covid: item
      });
    }

    
  });
console.log(countriesWithCovid)
  world.polygonsData(countriesWithCovid);

  // Show total counts
  const totalInfected = data.reduce((a, b) => a + b.cases, 0);
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
            Math.sqrt(+feat.properties.POP_EST) * 7e-5
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
