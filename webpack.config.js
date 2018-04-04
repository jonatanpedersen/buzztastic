const webpack = require('webpack');
const path = require('path');

const shared = {
	module: {
		rules: [
			{ test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
		]
	},
	devtool: 'hidden',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"development"'
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
	entry: ['./build/clients/www/index.js'],
	output: {
		path: path.resolve('static/www'),
		filename: 'index.js'
	}
}];
