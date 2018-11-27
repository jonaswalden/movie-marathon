import {h, render, Component} from 'preact';
import movies from './movies.js';

export default class Library extends Component {
	constructor (props) {
		super(props);
		this.state = {
			movies: movies.slice()
		};
	}

	selectItem (selectedMovie) {
		this.props.addPlaylistItem(selectedMovie);
		this.setState({
			movies: this.state.movies.filter(movie => movie.id !== selectedMovie.id)
		});
	}

	render (props, state) {
		return <section class="library">
			<ul>
				{state.movies.map(movie => 
					<LibraryItem key={movie.id} select={this.selectItem.bind(this, movie)} movie={movie} />
				)}
			</ul>
		</section>
	}
}

function LibraryItem (props) {
	return <li class="library__item">
		<img src={`https://m.media-amazon.com/images/M/${props.movie.cover}`} />
		<div>
			<h4 onClick={props.select}>{props.movie.title}</h4>
			<p>{props.movie.year}, {props.movie.duration} min</p>
			<p>{props.movie.genres.join(', ')}</p>
		</div>
	</li>;
}