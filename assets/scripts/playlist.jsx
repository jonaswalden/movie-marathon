import {h, render, Component} from 'preact';

class ListItem extends Component {
	constructor (props) {
		super(props);
	}

	toggle (open) {

		if (open) {
			this.props.onOpen(this.props.id);
			this.element.scrollIntoView({
				behavior: 'smooth',
				inline: 'center'
			});
		}
	}

	render (props, state) {
		const open = props.openItem === props.id;
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
			openItem: currentItem && currentItem.id
		};
	}

	onOpen (openItem) {
		this.setState({openItem})
	}

	render (props, state) {
		return <main class="playlist">
			<ol>
				{state.items.map(item => <ListItem key={item.id} openItem={state.openItem} onOpen={this.onOpen.bind(this)} {...item} />)}
			</ol>
		</main>;
	}
}