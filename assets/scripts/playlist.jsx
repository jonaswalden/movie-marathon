import {h, Component} from 'preact';
import Panel from './Panel.jsx';

class ListItem extends Component {
	constructor (props) {
		super(props);
		this.copyMediaUrl = this.copyMediaUrl.bind(this);		
	}

	copyMediaUrl () {
		const {value} = this.mediaUrlInput;
		this.mediaUrlInput.focus();
		this.mediaUrlInput.setSelectionRange(0, value.length);
		document.execCommand('copy');
		this.props.edit(this.props.movie.id, {
			startedTime: new Date(),
			status: 1
		});
	}

	static timeStamp (dateString) {
		const date = new Date(dateString);
		return [date.getHours(), date.getMinutes()]
			.map(n => n.toString())
			.map(s => s.padStart(2, '0'))
			.join(':');
	}

	render (props) {
		const mediaUrl = '\\\\NAS\\Series\\Seinfeld\\Season 8\\Seinfeld.S08E20.The.Millennium.DVDRip.x264-HEiT.mkv';
		const panelProps = {
			tag: "li",
			bullet: `#${props.order}`,
			label: props.movie.title,
			meta: props.startedTime && ListItem.timeStamp(props.startedTime) || '',
			background: props.movie.splash, 
		};

		return <Panel class="playlist__item" {...panelProps}>
			<div class="playlist__item__content">
				<img src={props.movie.cover} />
				<h3>{props.movie.title}</h3>
				<p>{props.movie.year}, {props.movie.duration} min</p>
				<p>{props.movie.genres.join(', ')}</p>
				<button type="button" onClick={this.copyMediaUrl}>▶ Copy URL</button>
				<input type="text" value={mediaUrl} ref={element => this.mediaUrlInput = element} />
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
					return <ListItem key={item.movie.id} order={index + 1} edit={props.editItem} {...item} />
				})}
			</ol>
		</section>;
	}
}