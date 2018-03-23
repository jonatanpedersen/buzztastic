const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: ['./src/client/index.js'],
	output: {
		path: path.resolve('app'),
		filename: 'index.js'
	},
	module: {
		rules: [
			{ test: /\.js?$/, loader: 'babel-loader', exclude: /node_modules/ }
		]
	},
	devtool: 'hidden',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		})
	]
}