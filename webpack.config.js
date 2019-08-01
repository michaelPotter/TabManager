const path = require('path')

module.exports = {
	entry: {
		popup: './popup.js',
		background: './js/background.js'
	},
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	}
};
