import Globe from 'globe.gl';
import { CountUp } from 'countup.js';
import * as d3 from 'd3';

// Globe container
const globeContainer = document.getElementById('globeViz');
// Globe image url
const globeImageUrl =
  '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg';
// Background image url
const backgroundImageUrl =
  '//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png';
// Geojson url
const geojsonUrl =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
// COVID-19 cases api
const apiUrl = 'https://corona.lmao.ninja/countries?sort=country';

const colorScale = d3.scaleSequentialPow(d3.interpolateOrRd).exponent(1/4)
const getVal = feat => feat.covid.cases;

let world;

init();

function init() {
  world = Globe()(globeContainer)
    .globeImageUrl(globeImageUrl)
    .backgroundImageUrl(backgroundImageUrl)
    .polygonAltitude(0.06)
    .polygonCapColor(feat => colorScale(getVal(feat)))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.05)')
    .polygonStrokeColor(() => '#111')
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
    )
    .onPolygonHover(hoverD => world
      .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
      .polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
    )
    .polygonsTransitionDuration(300);

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

    
  const maxVal = Math.max(...countriesWithCovid.map(getVal));
  colorScale.domain([0, maxVal]);
  });

  world.polygonsData(countriesWithCovid);
  document.querySelector('.title-desc').innerHTML = 'Hover on a country or territory to see cases, deaths, and recoveries.'

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

// Responsive globe
window.addEventListener('resize', (event) => {
  world.width([event.target.innerWidth])
  world.height([event.target.innerHeight])
});
