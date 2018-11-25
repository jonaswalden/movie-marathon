import movies from "./movies.js";
import playlist from "./playlist.js";

init();

function init () {
	const container = document.querySelector(".library");
	const items = container.querySelectorAll(".library__item");
	items.forEach((item, index) => item.addEventListener("click", add.bind(item, index)));

	function add (index) {
		playlist.add(movies[index]);
	}
}