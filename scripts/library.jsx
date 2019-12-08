import {h, Component} from 'preact';
import movies from '../data/movies.js';
import Panel from './Panel.jsx';

function LibraryItem (props) {
	return <li class="library__item">
		<div class="library__item__cover">
			<img src={props.movie.cover} />
		</div>
		<div class="library__item__content">
			<h4>{props.movie.title}</h4>
			<p>{props.movie.year}, {props.movie.duration + " min"}</p>
			<p>{(props.movie.genres || []).join(', ')}</p>

			<div class="library__item__actions">
				{props.externalAction}
				<button type="button" onClick={() => props.select(props.movie)}>Add +</button>
			</div>
		</div>
	</li>;
}

class RandomLibraryItem extends Component {
	constructor (props) {
		super(props);
		this.randomize = this.randomize.bind(this);
		this.selectItem = this.selectItem.bind(this);
		this.state = {
			movie: null
		}
	}

	randomize () {
		const index = Math.floor(Math.random() * this.props.options.length);
		this.setState({
			movie: this.props.options[index]
		})
	}

	selectItem (...args) {
		this.setState({movie: null});
		this.props.selectItem(...args);
	}

	render (props, state) {
		if (props.hide) return;

		const randomizeButton = <button type="button" onClick={this.randomize}>&nbsp;???&nbsp;</button>;
		if (state.movie) return <LibraryItem select={this.selectItem} movie={state.movie} externalAction={randomizeButton} />;

		return <li class="library__item">
			<div class="library__item__cover"></div>
			<div class="library__item__content">
				<h4>Randomize</h4>
				{randomizeButton}
			</div>
		</li>;
	}
}

export default class Library extends Component {
	constructor (props) {
		super(props);
		this.controls = {};
		this.selectItem = this.selectItem.bind(this);
		this.updateFilter = this.updateFilter.bind(this);
		this.state = {
			filtered: false,
			genreFilter: '',
			titleFilterPattern: /./i,
			sortProperty: 'title',
			sortOrder: true,
		};
		this.movies = movies.slice();
		this.genres = [...(new Set(movies.map(m => m.genres).flat().sort()))];
	}

	selectItem (selectedMovie) {
		this.props.addPlaylistItem(selectedMovie);

		if (this.state.titleFilter) {
			this.controls.titleFilter.value = '';
			this.controls.genreFilter.value = '';
			this.updateFilter();
		}
	}

	updateFilter () {
		const titleFilter = this.controls.titleFilter.value;
		const genreFilter = this.controls.genreFilter.value;
		this.setState({
			filtered: Boolean(titleFilter || genreFilter),
			titleFilterPattern: new RegExp(titleFilter || '.', 'i'),
			genreFilter,
			sortProperty: this.controls.sortProperty.value,
			sortOrder: !!+this.controls.sortOrder.value,
		});
	}

	render (props, state) {
		const usedMovieIds = props.playlistItems.map(item => item.movie.id);
		const unusedMovies = this.movies.filter(movie => !usedMovieIds.includes(movie.id));

		return <Panel tag="section" id="library" class="library" bullet="+" label="More" default={true}>
			<form>
				<label>Search</label>
				<input type="search" onInput={this.updateFilter} ref={element => this.controls.titleFilter = element} />

				<label>Genre</label>
				<select onChange={this.updateFilter} ref={element => this.controls.genreFilter = element}>
					<option value=""></option>
					{this.genres.map(genre =>
						<option value={genre}>{genre}</option>
					)}
				</select>

				<label>Sort by</label>
				<select onChange={this.updateFilter} ref={element => this.controls.sortProperty = element}>
					<option value="title">Title</option>
					<option value="release">Release</option>
					<option value="duration">Duration</option>
				</select>

				<label>Order</label>
				<select onChange={this.updateFilter} ref={element => this.controls.sortOrder = element}>
					<option value="1">A - Z</option>
					<option value="0">Z - A</option>
				</select>
			</form>

			<ul>
				<RandomLibraryItem hide={state.filtered} selectItem={this.selectItem} options={unusedMovies} />
				{unusedMovies
					.filter(movie => state.titleFilterPattern.test(movie.title))
					.filter(movie => !state.genreFilter || movie.genres.includes(state.genreFilter))
					.sort((a, b) => {
						const order = a[state.sortProperty] > b[state.sortProperty];
						if (!state.sortOrder) return order ? -1 : 1;
						return order ? 1 : -1;
					})
					.map(movie => {
						return <LibraryItem key={movie.id} select={this.selectItem} movie={movie} />;
					})}
			</ul>
		</Panel>;
	}
}
