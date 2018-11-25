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