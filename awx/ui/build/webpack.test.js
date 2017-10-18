const webpack = require('webpack');
const merge = require('webpack-merge');

const STATIC_PATH = '/static/';

const base = require('./webpack.base');

const test = {
    devtool: 'cheap-source-map',
    plugins: [
        new webpack.DefinePlugin({
            STATIC_PATH,
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ]
};

module.exports = merge(base, test);

