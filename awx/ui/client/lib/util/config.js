import _ from 'lodash';
import { join } from 'path';

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
    return fetchApiRoot()
        .then(fetchApiCurrentResourceList);
}

function fetchApiRoot () {
    return new Promise((resolve, reject) => {
        const request = $.ajax(join(get('ui.path.api')));

        request.done(res => {
            _.set(config, 'api.root', res);
            resolve();
        });

        request.fail(err => reject(err));
    });
}

function fetchApiCurrentResourceList () {
    return new Promise((resolve, reject) => {
        const request = $.ajax(join(get('api.root.current_version')));

        request.done(res => {
            _.set(config, 'api.resources', res);
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
