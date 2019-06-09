import apiKey from '../omdbApiKey.js';
import currentMovies from '../data/omdbMovies.js';
import fs from 'fs';
import http from 'http';
import path from 'path';

// $ node --experimental-modules utilities/getMovie.js tt1860242

const movieIds = process.argv.slice(2);
console.log('INPUT', movieIds);

Promise.all(movieIds.map(fetchMovie))
  .then(addToCurrentMovies)
  .then(sortByRelease)
  .then(exportToFile)
  .then(() => console.log('SUCCESS'))
  .catch(err => console.error('FAIL', err));

function fetchMovie (imdbId) {
  const url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`;

  return new Promise(function (resolve, reject) {
    let rawData = '';
    const req = http.get(url, collect);
    req.on("error", reject);

    function collect (res) {
      res.on('data', chunk => rawData += chunk);
      res.on('end', done);
    }

    function done () {
      try {
        const data = JSON.parse(rawData);
        resolve(data);
      }
      catch (err) {
        reject(err);
      }
    }
  });
}

function addToCurrentMovies (newMovies) {
  return currentMovies.concat(newMovies);
}

function sortByRelease (movies) {
  return movies.sort((a, b) => new Date(a.Released) > new Date(b.Released) ? 1 : -1);
}

function exportToFile (movies) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve('./data/omdbMovies.js'), toCode(), resolve);

    function toCode () {
      try {
        return `export default ${JSON.stringify(movies, null, '\t')};\n`
      }
      catch (err) {
        reject(err);
      }
    }
  });
}
