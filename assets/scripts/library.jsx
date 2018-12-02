import {h, Component} from 'preact';
import movies from './movies.js';
import Panel from './Panel.jsx';

function LibraryItem (props) {
	return <li class="library__item">
		<img src={props.movie.cover} />
		<div>
			<h4 onClick={() => props.select(props.movie)}>{props.movie.title}</h4>
			<p>{props.movie.year}, {props.movie.duration} min</p>
			<p>{props.movie.genres.join(', ')}</p>
		</div>
	</li>;
}

export default class Library extends Component {
	constructor (props) {
		super(props);
		this.selectItem = this.selectItem.bind(this);
		this.state = {
			movies: movies.slice()
		};
	}

	selectItem (selectedMovie) {
		this.props.addPlaylistItem(selectedMovie);
	}

	render (props, state) {
		const usedMovieIds = props.playlistItems.map(item => item.movie.id);

		return <Panel tag="section" id="library" class="library" bullet="+" label="More" default={true}>
			<ul>
				{state.movies
					.filter(movie => !usedMovieIds.includes(movie.id))
					.map(movie => {
						return <LibraryItem key={movie.id} select={this.selectItem} movie={movie} />;
					})}
			</ul>
		</Panel>;
	}
}