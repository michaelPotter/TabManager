const path = require('node:path')
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: {
		app: './src/app.tsx',
		background: './src/js/background.ts',
		direct_to_popout: './src/launching/direct_to_popout.ts',
	},
	devtool: 'source-map',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		 //// TODO this would have webpack build the html, auto-adding links to the generated js and css.
		 //// Problem is it also tries to import the background.js script, which we (probably) don't want.
		 //// See: https://webpack.js.org/plugins/html-webpack-plugin
		//new HtmlWebPackPlugin({
			//////chunks: ['index'],
			//template: "./src/popup.html",
			//filename: "popup.html",
			//scriptLoading: "module",
		//}),
		new MiniCssExtractPlugin({
			// filename: `assets/css/tabmanager.[contenthash].css`
			filename: `tabmanager.css`
		}),
	],
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
			},
			{
				// Compile SCSS to CSS.
				test: /\.(sc|sa|c)ss$/i,
				sideEffects: true,
				use: [
					MiniCssExtractPlugin.loader, // instead of style-loader
					{
						// Interprets `@import` and `url()` like `import/require()` and will resolve them
						loader: 'css-loader'
					},
					{
						// Loader for webpack to process CSS with PostCSS
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									"autoprefixer"
								]
							}
						}
					},
					{
						// This resolves url() paths in SCSS files (e.g. fontello.scss) to filesystem paths.
						loader: 'resolve-url-loader'
					},
					{
						// Loads a SASS/SCSS file and compiles it to CSS
						loader: 'sass-loader',
						options: {
							sourceMap: true // resolve-url-loader needs source maps enabled.
						}
					}
				]
			},
		]
	},
	stats: {
		errorDetails: true
	},
};
