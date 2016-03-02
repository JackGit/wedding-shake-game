
'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
    /*entry: './src/main.js',
    output: {
        filename: './dist/bundle.js',
    },*/
    entry: {
        player: './src/main.js',
        admin: './src/main-admin.js',
        monitor: './src/main-monitor.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    /*devtool: 'source-map',*/
    module: {
        loaders: [
            //{test: /\.css$/, loader: 'style!css!'},
            {test: /\.(png|jpg)$/, loader: 'file'},
            {test: /\.vue$/, loader: 'vue'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}