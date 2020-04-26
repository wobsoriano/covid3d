const express = require('express');
const apicache = require('apicache');
const cors = require('cors');
const TimeSeries = require('./TimeSeries');

const cache = apicache.middleware;

const PORT = 3030;

const app = express();
app.use(cors());
app.use(cache('1 hour'));

app.get('/', async (req, res) => {
  const data = await TimeSeries.fetchTimeSeries();
  return res.json(data);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
