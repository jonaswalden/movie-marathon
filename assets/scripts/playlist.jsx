import {h, Component} from 'preact';
import Panel from './Panel.jsx';

class ListItem extends Component {
	constructor (props) {
		super(props);
	}

	render (props, state) {
		const panelProps = {
			tag: "li",
			bullet: `#${props.order}`,
			label: props.movie.title,
			meta: '',
			background: props.movie.splash, 
		};

		return <Panel class="playlist__item" {...panelProps}>
			<div class="playlist__item__content">
				<img src={props.movie.cover} />
				<h3>{props.movie.title}</h3>
				<p>{props.movie.year}, {props.movie.duration} min</p>
				<p>{props.movie.genres.join(', ')}</p>
				<p>
					<a href="\\NAS\Series\Seinfeld\Season%208\Seinfeld.S08E19.The.Yada.Yada.DVDRip.x264-HEiT.mkv">Play</a>
				</p>
			</div>
		</Panel>;
	}
}

export default class Playlist extends Component {
	constructor (props) {
		super(props);
	}

	render (props) {
		return <section class="playlist">
			<ol class="panel__container">
				{props.items.map((item, index) => {
					return <ListItem key={item.id} order={index + 1} {...item} />
				})}
			</ol>
		</section>;
	}
}