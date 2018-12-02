export function getItem (key) {
	const data = localStorage.getItem(key);
	if (!data) return data;
	
	return JSON.parse(data);
}

export function setItem (key, data) {
	const value = JSON.stringify(data);
	localStorage.setItem(key, value);
}