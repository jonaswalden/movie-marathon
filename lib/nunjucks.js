'use strict';

const nunjucks = require('nunjucks');
const path = require('path');

const baseDir = path.join(__dirname, '../views');
nunjucks.configure(baseDir);

module.exports = nunjucks;