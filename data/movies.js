import localMovieMeta from './localMovieMeta.js';
import omdbMovies from './omdbMovies.js';

export default omdbMovies.reduce(format, []);

function format (items, omdbMovie) {
  const local = localMovieMeta[omdbMovie.imdbID] || {};
  const insertions = (local.episodes || [local])
    .map(format);

  items.push(...insertions);
  return items;

  function format (localMeta) {
    return {
      id: join('-', omdbMovie.imdbID, localMeta.id),
      type: omdbMovie.Type,
      title: join(' ', omdbMovie.Title, localMeta.title),
      year: Number(omdbMovie.Year),
      release: new Date(omdbMovie.Released),
      duration: localMeta.duration || parseInt(omdbMovie.Runtime),
      genres: omdbMovie.Genre.split(", "),
      cover: `/images/${join('-', omdbMovie.imdbID)}.jpg`,
      splash: `/images/${join('-', omdbMovie.imdbID, localMeta.id, 'splash')}.jpg`,
      media: localMeta.media,
    };
  }

  function join (delimiter, ...parts) {
    return parts
      .filter(Boolean)
      .join(delimiter);
  }
}
