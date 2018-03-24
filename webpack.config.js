const webpack = require('webpack');
const path = require('path');

const shared = {
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
};

module.exports = [{
	...shared,
	entry: ['./src/clients/app/index.js'],
	output: {
		path: path.resolve('clients/app'),
		filename: 'index.js'
	}
}, {
	...shared,
	entry: ['./src/clients/www/index.js'],
	output: {
		path: path.resolve('clients/www'),
		filename: 'index.js'
	}
}];