const path = require('path')

module.exports = {
	entry: './popup.js',
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: 'popup.js',
		path: path.resolve(__dirname, 'dist')
	}
};
