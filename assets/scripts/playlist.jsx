import {h, render, Component} from 'preact';
import Library from './library.jsx';

class ListItem extends Component {
	constructor (props) {
		super(props);
	}

	toggle (open) {		
		if (!open) return this.props.onItemToggle(null);
		
		this.props.onItemToggle(this.props.id);
		this.element.scrollIntoView({
			behavior: 'smooth',
			inline: 'center'
		});
	}

	render (props, state) {
		const open = props.openItemId === props.id;

		return <li class={`playlist__item ${open ?  "playlist__item--open" : ""}`} ref={element => this.element = element}>
			<div class="playlist__item__splash" style={`background-image: url(${props.splash}`}></div>

			<div class="playlist__item__tab" onClick={this.toggle.bind(this, true)}>
				<span>{props.title}</span>
			</div>

			<div class="playlist__item__content">
				<div>
					<img src={`https://m.media-amazon.com/images/M/${props.cover}`} width="320"/>
					<h3>{props.title}</h3>
					<p>{props.year}, {props.duration} min</p>
					<p>{props.genres.join(', ')}</p>
				</div>
			</div>
		</li>;
	}
}

export default class Playlist extends Component {
	constructor (props) {
		super(props);

		const currentItem = props.items.find(item => item.status === 1);

		this.state = {
			items: props.items,
			openItemId: currentItem && currentItem.id
		};
	}

	onItemToggle (openItemId) {
		this.setState({openItemId})
	}

	addItem (movie) {
		const newItem = Object.assign({
			status: 0
		}, movie);

		this.setState({
			items: this.state.items.concat(newItem)	
		});
	}

	render (props, state) {
		return <main class="playlist">
			<ol>
				{state.items.map(item => {
					return <ListItem key={item.id} openItemId={state.openItemId} onItemToggle={this.onItemToggle.bind(this)} {...item} />
				})}

				<li class={`playlist__item playlist__item--add ${!state.openItemId ?  "playlist__item--open" : ""}`}>
					<div class="playlist__item__splash"></div>
					<div class="playlist__item__tab" onClick={this.onItemToggle.bind(this, null)}>
						<span>More +</span>
					</div>
					<div class="playlist__item__library">
						<Library addPlaylistItem={this.addItem.bind(this)} />
					</div>
				</li>
			</ol>
		</main>;
	}
}