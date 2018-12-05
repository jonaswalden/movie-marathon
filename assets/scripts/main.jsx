import * as storage from './storage.js';
import {h, render, Component} from 'preact';
import Library from './library.jsx';
import movies from './movies.js';
import Panel from './Panel.jsx';
import Playlist from './playlist.jsx';

class Main extends Component {
	constructor () {
		super();
		this.addPlaylistItem = this.addPlaylistItem.bind(this);
		this.removePlaylistItem = this.removePlaylistItem.bind(this);
		this.editPlaylistItem = this.editPlaylistItem.bind(this);
		this.state = {
			playlistItems: storage.getItem('playlistItems') || []
		};
	}

	addPlaylistItem (movie) {
		this.setState({
			playlistItems: this.state.playlistItems.concat({
				status: 0,
				movie: movie
			})
		});
	}

	removePlaylistItem (movieId) {
		const itemIndex = this.state.playlistItems.findIndex(item => item.movie.id === movieId);
		if (itemIndex < 0) return console.warn('no such item', movieId);

		this.setState({
			playlistItems: [].concat(
					this.state.playlistItems.slice(0, itemIndex), 
					this.state.playlistItems.slice(itemIndex + 1)
				)
		});
	}

	editPlaylistItem (movieId, changes) {
		const itemIndex = this.state.playlistItems.findIndex(item => item.movie.id === movieId);
		if (itemIndex < 0) return console.warn('no such item', movieId);

		this.setState((state) => {
			Object.assign(state.playlistItems[itemIndex], changes);
			return {
				playlistItems: state.playlistItems
			};
		});
	}

	componentDidUpdate () {
		storage.setItem('playlistItems', this.state.playlistItems)
	}

	render (props, state) {
		return <body class="panel__container">
			<Panel tag="header" bullet="☰" label="Cosathon #1 2018" />
			<Playlist items={state.playlistItems} removeItem={this.removePlaylistItem} editItem={this.editPlaylistItem} />
			<Library playlistItems={state.playlistItems} addPlaylistItem={this.addPlaylistItem} />
		</body>;
	}
}

render(<Main />, document.documentElement, document.body);
