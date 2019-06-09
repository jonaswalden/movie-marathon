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
      id: join('-', omdbMovie.imdbID, localMeta.episode),
      type: omdbMovie.Type,
      title: join(' ', omdbMovie.Title, localMeta.title),
      year: Number(omdbMovie.Year),
      release: getRelease(omdbMovie.Released, localMeta.episode),
      duration: localMeta.duration || parseInt(omdbMovie.Runtime),
      genres: omdbMovie.Genre.split(", "),
      cover: localMeta.cover || omdbMovie.Poster,
      splash: `/images/${join('-', omdbMovie.imdbID, localMeta.episode, 'splash')}.jpg`,
      media: localMeta.media,
    };
  }

  function join (delimiter, ...parts) {
    return parts
      .filter(Boolean)
      .join(delimiter);
  }

  function getRelease (release, order) {
    release = new Date(release);

    if (order) {
      release.setMilliseconds(order);
    }

    return release;
  }
}
