import {h, render, Component} from 'preact';
import Library from './library.jsx';
import movies from './movies.js';
import Panel from './Panel.jsx';
import Playlist from './playlist.jsx';

const playlistItems = movies.slice(0, 3)
	.map((movie, index) => { 
		return {
			status: index === 1 ? 1 : 2,
			movie,
		};
	});

class Main extends Component {
	constructor () {
		super();
		this.addPlaylistItem = this.addPlaylistItem.bind(this);
		this.state = {
			playlistItems
		};
	}

	addPlaylistItem (movie) {
		console.log("adding", this.state.playlistItems);
		this.setState({
			playlistItems: this.state.playlistItems.concat({
				status: 0,
				movie: movie
			})
		})
	}

	render (props, state) {
		console.log('render', state.playlistItems);
		return <body class="panel__container">
			<Panel tag="header" bullet="☰" label="Cosathon #1 2018" />
			<Playlist items={state.playlistItems} />
			<Library playlistItems={state.playlistItems} addPlaylistItem={this.addPlaylistItem} />
		</body>;
	}
}

render(<Main />, document.documentElement, document.body);
