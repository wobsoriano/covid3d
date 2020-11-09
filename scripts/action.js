const path = require('path');
const fs = require('fs');
const Scraper = require('./Scraper');

const pathToData = path.join(__dirname, '/..', 'data') + '.json';

async function run() {
    const scraper = new Scraper();
    const data = await scraper.fetchTimeSeries();
    fs.writeFileSync(path.resolve(pathToData), JSON.stringify(data));
}
  
run();