import {h, Component} from 'preact';

export default class Panel extends Component {
	constructor (props) {
		super(props);
		this.open = this.open.bind(this);
		props.tag = props.tag || 'div';
	}

	open () {
		const currentOpen = document.querySelector('.panel--open');
		if (currentOpen) currentOpen.classList.remove('panel--open');
		this.element.classList.add('panel--open');
		this.element.scrollIntoView({
			behavior: 'smooth',
			inline: 'center',
		});
	}

	componentDidMount() {
		if (!this.props.default) return;

		this.open();
	}

	render (props) {
		const attrs = {};
		attrs.class = props.class ? props.class + ' panel' : 'panel';

		return <props.tag {...attrs} ref={element => this.element = element}>
			{'background' in props &&
				<img class="panel__background" src={props.background} />
			}
			<div class="panel__tab" onClick={this.open}>
				<strong>{props.bullet}</strong>
				<span>{props.label}</span>
				{'meta' in props &&
					<span>{props.meta}</span>
				}
			</div>

			<div class="panel__content">
				{props.children}
			</div>
		</props.tag>;
	}
}
