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
		this.controls = {};
		this.selectItem = this.selectItem.bind(this);
		this.updateFilter = this.updateFilter.bind(this);
		this.state = {
			movies: movies.slice(),
			sortProperty: 'title',
			sortReversed: false,
		};
	}

	selectItem (selectedMovie) {
		this.props.addPlaylistItem(selectedMovie);
	}

	updateFilter () {
		this.setState({
			sortProperty: this.controls.sortProperty.value,
			sortReversed: this.controls.sortReversed.checked,
		});
	}

	render (props, state) {
		const usedMovieIds = props.playlistItems.map(item => item.movie.id);

		return <Panel tag="section" id="library" class="library" bullet="+" label="More" default={true}>
			<form>
				<label>Order by</label>
				<select onChange={this.updateFilter} ref={element => this.controls.sortProperty = element}>
					<option value="title">Title</option>
					<option value="year">Year</option>
					<option value="duration">Duration</option>
				</select>

				<label>Reverse</label>
				<input type="checkbox" onChange={this.updateFilter} ref={element => this.controls.sortReversed = element} />
			</form>
			
			<ul>
				{state.movies
					.filter(movie => !usedMovieIds.includes(movie.id))
					.sort((a, b) => {
						const order = a[state.sortProperty] > b[state.sortProperty];
						if (state.sortReversed) return order ? -1 : 1;
						return order ? 1 : -1;
					}) 
					.map(movie => {
						return <LibraryItem key={movie.id} select={this.selectItem} movie={movie} />;
					})}
			</ul>
		</Panel>;
	}
}