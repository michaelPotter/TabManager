const path = require('path')

module.exports = {
	entry: {
		popup: './src/popup.js',
		background: './src/js/background.js'
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
					}
				},
				{
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						presets: ['@babel/preset-react'],
						// presets: ['@babel/preset-env', '@babel/preset-react'],
						plugins: [
							// '@babel/plugin-proposal-optional-chaining',
							// '@babel/plugin-proposal-nullish-coalescing-operator',
						],
					}
				}
			]
		}]
	}
};
