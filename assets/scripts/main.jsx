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
		console.log('did update');
		storage.setItem('playlistItems', this.state.playlistItems)
	}

	render (props, state) {
		console.log('render', state.playlistItems);
		return <body class="panel__container">
			<Panel tag="header" bullet="☰" label="Cosathon #1 2018" />
			<Playlist items={state.playlistItems} editItem={this.editPlaylistItem} />
			<Library playlistItems={state.playlistItems} addPlaylistItem={this.addPlaylistItem} />
		</body>;
	}
}

render(<Main />, document.documentElement, document.body);
