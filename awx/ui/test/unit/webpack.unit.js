const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('../../build/webpack.base');

const STATIC_PATH = '/static/';

const test = {
    devtool: 'cheap-source-map',
    plugins: [
        new webpack.DefinePlugin({
            STATIC_PATH
        })
    ]
};

module.exports = merge(base, test);
