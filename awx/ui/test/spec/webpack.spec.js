const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require(path.resolve(__dirname, '../..', 'build/webpack.base'));

const STATIC_PATH = '/static/';

const test = {
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            STATIC_PATH
        })
    ]
};

module.exports = merge(base, test);
