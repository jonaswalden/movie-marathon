import babel from 'rollup-plugin-babel';

export default {
	external: {'preact'},
	plugins: [babel()],
};