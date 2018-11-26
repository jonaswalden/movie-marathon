import {h, render, Component} from 'preact';
import Playlist from './playlist.jsx';
import movies from './movies.js';

const playlistItems = movies.slice(0, 3)
	.map((movie, index) => Object.assign({
			status: index === 1 ? 1 : 2
		}, movie));

render((
	<Playlist items={playlistItems} />
), document.body);
