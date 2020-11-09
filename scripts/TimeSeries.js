const request = require('request');
const csv = require('csvtojson');

class Scraper {
  constructor() {
    this.timeSeriesURL =
      'https://raw.githubusercontent.com/bumbeishvili/covid19-daily-data/master';
    this.countryRenameMapper = {
      USA: 'United States of America',
      UAE: 'United Arab Emirates',
      UK: 'United Kingdom',
      "Cote d'Ivoire": 'Ivory Coast',
      DRC: 'Democratic Republic of the Congo',
      Bahamas: 'The Bahamas',
    };
  }

  async fetchTimeSeries() {
    const roundOffCoord = (coord) => parseFloat(coord.trim()).toFixed(5);

    let countryMapper = {};

    const [confirmedRows, recoveredRows, deathRows] = await Promise.all([
      this.getConfirmedCases(),
      this.getRecovered(),
      this.getDeaths(),
    ]);

    const headers = Object.keys(confirmedRows[0]);

    confirmedRows.forEach((row) => {
      headers.slice(4).forEach((header) => {
        // Check if there's matching row in recovered csv
        const recoveries = recoveredRows.find(
          (i) =>
            roundOffCoord(i.Lat) === roundOffCoord(row.Lat) &&
            roundOffCoord(i.Long) === roundOffCoord(row.Long)
        );

        // Check if there's matching row in death csv
        const deaths = deathRows.find(
          (i) =>
            roundOffCoord(i.Lat) === roundOffCoord(row.Lat) &&
            roundOffCoord(i.Long) === roundOffCoord(row.Long)
        );

        const countryName = this.countryRenameMapper[row['Country/Region']]
          ? this.countryRenameMapper[row['Country/Region']]
          : row['Country/Region'];

        if (countryMapper[countryName]) {
          countryMapper[countryName][header] = {
            confirmed: Math.round(+row[header]) || 0,
            recoveries: recoveries ? Math.round(+recoveries[header]) : 0,
            deaths: deaths ? Math.round(+deaths[header]) : 0,
          };
        } else {
          countryMapper[countryName] = {
            [header]: {
              confirmed: Math.round(+row[header]) || 0,
              recoveries: recoveries ? Math.round(+recoveries[header]) : 0,
              deaths: deaths ? Math.round(+deaths[header]) : 0,
            },
          };
        }
      });
    });

    return countryMapper;
  }

  parseCSV(url) {
    return new Promise((resolve, reject) => {
      const rows = [];
      csv()
        .fromStream(request.get(url))
        .subscribe(
          (json) => {
            rows.push(json);
          },
          () => {
            reject();
          },
          () => {
            resolve(rows);
          }
        );
    });
  }

  getConfirmedCases() {
    return this.parseCSV(
      `${this.timeSeriesURL}/time_series_19-covid-Confirmed.csv`
    );
  }

  getRecovered() {
    return this.parseCSV(
      `${this.timeSeriesURL}/time_series_19-covid-Recovered.csv`
    );
  }

  getDeaths() {
    return this.parseCSV(
      `${this.timeSeriesURL}/time_series_19-covid-Deaths.csv`
    );
  }
}

module.exports = Scraper;
