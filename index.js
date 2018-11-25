'use strict';

const Koa = require("koa");
const serveStatic = require('koa-static');
const Router = require('koa-router');
const nunjucks = require('./lib/nunjucks');
const library = require('./library');
const path = require('path');

const app = new Koa();
const router = new Router();

app.on('error', err => console.error(err));

router.get('/', renderPage);
router.get('/playlist.m3u8', renderPlaylist);
router.get('/video', renderVideo);

app.use(serveStatic("./public"));
app.use(router.routes());
app.listen(3000);

async function renderPage (ctx) {
	ctx.body = await nunjucks.render('index.njk', {
		title: 'Cos-a-thon #1 2018',
		playlist: library.slice(0, 2),
		movies: library,
	});
}

async function renderPlaylist (ctx) {
	console.log('playlist');
	const playlist = [
		file('01-akrobatik-prelude_to_balance-cms.mp3'),
		file('05-akrobatik-remind_my_soul-cms.mp3'),
	];

	ctx.body = playlist.join("\n");

	function file (relativePath) {
		return path.join('D:\\mp3\\Hip-Hop\\Akrobatik-Balance-(CD_Retail)-2003-CMS', relativePath);
	}
}

function renderVideo (ctx) {
	ctx.body = `<!doctype html><audio controls><source src="/playlist.m3u8"></source></audio>`;
}
