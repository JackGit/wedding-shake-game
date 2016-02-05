
'use strict';
var webpack = require('webpack');

module.exports = {
    entry: {
        player: './public/javascripts/src/components/player/main.js',
        admin: './public/javascripts/src/components/admin/main.js'
    },
    output: {
        path: './public/javascripts/build',
        filename: '[name].bundle.js',
        publicPath: 'javascripts/build/'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            //{test: /\.css$/, loader: 'style!css!'},
            {test: /\.(png|jpg)$/, loader: 'file'},
            {test: /\.vue$/, loader: 'vue'}
        ]
    },
    /*plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]*/
}