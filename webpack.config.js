const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
	template: './src/client/index.pug',
	filetype: 'pug',
	filename: 'index.pug',
	inject: 'body'
})

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
		HtmlWebpackPluginConfig,
		new HtmlWebpackPugPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		})
	]
}