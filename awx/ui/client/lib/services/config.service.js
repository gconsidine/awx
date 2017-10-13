import _ from 'lodash';

function ConfigService () {
    this.config = {
        env: process.env.NODE_ENV || 'development'
    };

    this.get = key => _.get(this.config, key);
}

ConfigService.$inject = [];

export default ConfigService;
