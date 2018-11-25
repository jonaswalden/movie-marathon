const list = List(document.querySelector('.playlist'));
const addItem = list.element.querySelector(".playlist__item--add");
const itemTemplate = list.element.querySelector("template");

export default list;

function List (element) {
	const listInner = element.querySelector('ol');
	const items = Array.from(listInner.querySelectorAll('.playlist__item'))
		.map(Item);

	const model = items;

	return {
		element,
		add,
	};

	function add (movie) {
		const itemFragment = createItemElementFromTemplate(movie);
		listInner.insertBefore(itemFragment, addItem);
		const item = Item(addItem.previousElementSibling, movie);
		model.push(item);
	}
}

function Item (element, model) {
	let status = 0;
	element = element || createFromTemplate();
	const tab = element.querySelector(".playlist__item__tab");
	tab.addEventListener('click', open);

	return {
		element,
		id: model.id,
		get status () {
			return status;
		}
	};

	function open () {
		const openItem = list.element.querySelector('.playlist__item--open');
		if (openItem) openItem.classList.remove('playlist__item--open');

		element.classList.add('playlist__item--open');
		element.scrollIntoView({
			behavior: 'smooth',
			inline: 'center'
		});
	}
}

function createItemElementFromTemplate (model) {
	const itemFragment = document.importNode(itemTemplate.content, true);
	const splash = itemFragment.querySelector('.playlist__item__splash'); 
	const tabInner = itemFragment.querySelector('.playlist__item__tab span');
	const content = itemFragment.querySelector('.playlist__item__content');
	const [poster, title, ...metaRows] = content.querySelectorAll(`img, h3, p`);

	splash.style.backgroundImage = `url(${model.splash})`;
	tabInner.textContent = model.title;
	poster.src = model.poster;
	title.textContent = model.title;
	metaRows[0].textContent = `${model.year}, ${model.duration} min`;
	metaRows[1].textContent = model.genres.join(', ');

	return itemFragment;
}

/*
let container, itemList, itemTemplate, addItem, openItem;

export const playlist = [];
playlist.add = addMovie;

function addMovie (movie) {
	this.push({id: movie.id, status: 0});
	const itemFragment = document.importNode(itemTemplate.content, true);
	const [splash, tab, poster, title, metaRow1, metaRow2] = itemFragment.querySelectorAll(`
			.playlist__item__splash,
			.playlist__item__tab span,
			.playlist__item__content img,
			.playlist__item__content h3,
			.playlist__item__content p
		`);
	splash.style.backgroundImage = movie.splash;
	tab.textContent = movie.title;
	poster.src = movie.poster;
	title.textContent = movie.title;
	metaRow1.textContent = `${movie.year}, ${movie.duration} min`;
	metaRow2.textContent = movie.genres.join(', ');
	itemList.insertBefore(itemFragment, addItem);
	const item = addItem.previousElementSibling;
	initItem(item);
}

export default function init () {
	container = document.querySelector('.playlist');
	itemList = container.querySelector('ol');
	itemTemplate = container.querySelector('template');
	addItem = container.querySelector('.playlist__item--add');
	openItem = container.querySelector('.playlist__item--open');

	container.querySelectorAll('.playlist__item')
		.forEach(initItem);
} 

function initItem (item) {
	const tab = item.querySelector(".playlist__item__tab");
	tab.addEventListener('click', setOpenItem)
}


function setOpenItem (event) {
	openItem.classList.remove('playlist__item--open');
	openItem = event.currentTarget.closest('.playlist__item');
	openItem.classList.add('playlist__item--open');
	openItem.scrollIntoView({
		behavior: 'smooth',
		inline: 'center'
	});
}
*/