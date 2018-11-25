'use strict';

const Nunjucks = require('nunjucks');
const path = require('path');

const baseDir = path.join(__dirname, '../views');
const nunjucks = Nunjucks.configure(baseDir);

module.exports = {
	render(...args) {
		return new Promise((resolve, reject) => {
			nunjucks.render(...args, (err, result) => {
				if (err) return reject(err);
				resolve(result);
			});
		});
	}
};