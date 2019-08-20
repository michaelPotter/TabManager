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
	},
	module: {
		rules: [{
			test: /.jsx?$/,
			exclude: /(dist|lib|node_modules)/,
			use: [
				{
					loader: 'eslint-loader',
					options: {
						cache: true,
						// presets: ['@babel/preset-env', '@babel/preset-react']
					}
				},
				{
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						// presets: ['@babel/preset-env', '@babel/preset-react']
						presets: ['@babel/preset-react']
					}
				}
			]
		}]
	}
};
