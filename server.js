const fs = require('fs');
const util = require('util');
const express = require('express');
const orderBy = require('lodash/orderBy');
const uniqBy = require('lodash/uniqBy');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const MOVIE_FILES = process.env.MOVIE_FILES.split(',');
const TV_FILES = process.env.TV_FILES.split(',');

// App
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'pug')
app.use(express.static('src'))
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

const readFile = util.promisify(fs.readFile);
const appendToFile = util.promisify(fs.appendFile);
const writeFile = util.promisify(fs.writeFile);

const deserialise = (string) => {
  return string
    .trim()
    .split('\n')
    .map(str => {
      const matches = str.match(/^(#\s)?(.*)/);
      const selected = matches[1] === undefined ? false : true;
      const title = matches[2];

      return {
        title,
        selected,
        displayTitle: title.replace(/\(\d+\)\//, '').trim()
      };
    });
};

const serialise = (data) => data
  .map(o => `${o.selected ? '# ' : ''}${o.title}`)
  .join('\n');

const getList = async (files) => {
  const reads = files.map(file => readFile(file, {encoding: 'utf8'}));
  const all = await Promise.all(reads);
  const filtered = uniqBy(all.map(deserialise).flat(), 'title').filter(o => o.displayTitle.length);

  return orderBy(filtered, [o => o.displayTitle.toLowerCase()], ['asc']);
};

app.get('/', async (req, res) => {
  const [movies, tv] = await Promise.all([
    getList(MOVIE_FILES),
    getList(TV_FILES),
  ]);

  res.render('index', {
    movies,
    tv,
  });
});

app.post('/add/:type', async (req, res) => {
  const files = req.params.type === 'movies' ? MOVIE_FILES : TV_FILES;
  const data = `\n${serialise(req.body)}`;

  const writes = files.map(file => {
    return appendToFile(file, data);
  });

  await Promise.all(writes);

  res.sendStatus(201);
});

app.post('/save/:type', async (req, res) => {
  const files = req.params.type === 'movies' ? MOVIE_FILES : TV_FILES;
  const data = serialise(req.body);

  const writes = files.map(file => {
    return writeFile(file, data);
  });

  await Promise.all(writes);

  res.sendStatus(201);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
