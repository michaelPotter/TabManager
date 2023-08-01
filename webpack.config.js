const path = require('path')

module.exports = {
	entry: {
		popup: './src/popup.tsx',
		background: './src/js/background.ts'
	},
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /.jsx?$/,
				exclude: /(dist|lib|node_modules)/,
				use: [
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
			}
		]
	}
};
