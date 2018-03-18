const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
	template: './src/client/index.html',
	filename: 'index.html',
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
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		})
	]
}