import _ from 'lodash';

const ENV = process.env.NODE_ENV || 'development';

import base from '~config/config.base';
const env = require(`~config/config.${ENV}`);

const config = _.merge(base, env);

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
