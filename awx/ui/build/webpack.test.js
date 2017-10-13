const _ = require('lodash');
const webpack = require('webpack');

const STATIC_URL = '/static/';

const base = require('./webpack.base');

const test = {
    devtool: 'cheap-source-map',
    plugins: [
        new webpack.DefinePlugin({
            $basePath: STATIC_URL,
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ]
};

test.plugins = base.plugins.concat(test.plugins);

module.exports = _.merge(base, test);

