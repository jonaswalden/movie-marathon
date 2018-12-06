import {h, Component} from 'preact';
import Panel from './Panel.jsx';

class ListItem extends Component {
	constructor (props) {
		super(props);
		this.copyMediaUrl = this.copyMediaUrl.bind(this);		
		this.remove = this.remove.bind(this);		
	}

	copyMediaUrl () {
		this.mediaUrlInput.select();
		document.execCommand('copy');
		this.props.edit(this.props.movie.id, {
			startedTime: new Date(),
			status: 1
		});
	}

	remove () {
		this.props.remove(this.props.movie.id)
	}

	static timeStamp (dateString) {
		const date = new Date(dateString);
		return [date.getHours(), date.getMinutes()]
			.map(n => n.toString())
			.map(s => s.padStart(2, '0'))
			.join(':');
	}

	render (props) {
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
				<input type="text" value={props.movie.media} ref={element => this.mediaUrlInput = element} />
			</div>
			{!props.status && <div class="panel__tab playlist__item__remove" onClick={this.remove}><strong>&times;</strong></div>}
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
					return <ListItem key={item.movie.id} order={index + 1} remove={props.removeItem} edit={props.editItem} {...item} />
				})}
			</ol>
		</section>;
	}
}