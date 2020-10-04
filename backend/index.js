const express = require('express');
const apicache = require('apicache');
const cors = require('cors');
const fs = require('fs');

const cache = apicache.middleware;

const PORT = 3030;

const app = express();
app.use(cors());
app.use(cache('1 hour'));

app.get('/', (req, res) => {
  fs.readFile('data.json', (err, buffer) => {
    if (err) {
      return res.status(500).err({ err });
    }

    res.json(JSON.parse(buffer));
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
