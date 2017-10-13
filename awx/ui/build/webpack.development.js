const webpack = require('webpack');
const merge = require('webpack-merge');

const base = require('./webpack.base');

const development = {
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ]
};

module.exports = merge(base, development);
