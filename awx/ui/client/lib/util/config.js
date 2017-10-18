import _ from 'lodash';
import path from 'path';

const ENV = process.env.NODE_ENV || 'development';
const base = require('~config/config.base');
// eslint-disable-next-line import/no-dynamic-require
const env = require(`~config/config.${ENV}`);
const config = {
    env: ENV,
    ui: _.merge(base, env),
    api: null
};

try {
    // eslint-disable-next-line import/no-unresolved, global-require
    const local = require('~config/config.local');
    config.ui = _.merge(config.ui, local);
} catch (err) { } // eslint-disable-line no-empty

try {
    // eslint-disable-next-line import/no-unresolved, global-require
    const brand = require('~config/config.brand.json');
    config.ui = _.merge(config.ui, brand);
} catch (err) { } // eslint-disable-line no-empty

function init () {
    return new Promise((resolve, reject) => {
        const request = $.ajax(path.join(get('ui.path.api')));

        request.done(res => {
            config.api = res;
            resolve();
        });

        request.fail(err => reject(err));
    });
}

function get (key) {
    if (typeof key === 'undefined') {
        return config;
    }

    return _.get(config, key);
}

function has (key) {
    return _.has(config, key);
}

export default {
    init,
    get,
    has
};
