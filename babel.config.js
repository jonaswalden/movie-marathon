module.exports = () => {
	return {
		plugins: [
			["@babel/plugin-transform-react-jsx", {"pragma": "h"}]
		]	
	};
};