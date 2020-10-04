const express = require('express');
const apicache = require('apicache');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const cache = apicache.middleware;

const PORT = 3030;

const app = express();
app.use(cors());
app.use(cache('1 hour'));

app.get('/', (_, res) => {
  const location = path.join(__dirname, 'data.json');
  fs.readFile(location, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ err });
    }

    res.json(JSON.parse(buffer));
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
