import _ from 'lodash';

import base from '~config/config.base';

const ENV = process.env.NODE_ENV || 'development';
const env = require(`~config/config.${ENV}`);

let config = _.merge(base, env);
let local;
let brand;

try {
    local = require('~config/config.local');
} catch (err) { }

try {
    brand = require('~config/config.brand.json');
} catch (err) { }

if (brand) {
    config = _.merge(config, brand);
}

if (local) {
    config = _.merge(config, local);
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
    get,
    has
};
