const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
	template: './src/client/index.html',
	filename: 'index.html',
	inject: 'body'
})

module.exports = {
	entry: ['./src/client/index.js'],
	output: {
		path: path.resolve('public'),
		filename: 'index.js'
	},
	module: {
		loaders: [
			{ test: /\.js?$/, loader: 'babel-loader', exclude: /node_modules/ }
		]
	},
	devtool: 'hidden',
	plugins: [
		new BundleAnalyzerPlugin(),
		HtmlWebpackPluginConfig,
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin({
			mangle: true,
			compress: {
				warnings: false, // Suppress uglification warnings
				pure_getters: true,
				unsafe: true,
				unsafe_comps: true,
				screw_ie8: true
			},
			output: {
				comments: false,
			},
			exclude: [/\.min\.js$/gi] // skip pre-minified libs
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		})
	]
}