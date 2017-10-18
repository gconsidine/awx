import _ from 'lodash';

function ConfigService (CONFIG, ConfigModel) {
    this.config = CONFIG;
    this.configModelPromise = new ConfigModel('get');

    this.init = () => this.configModelPromise
        .then(model => {
            this.config.api = _.merge(this.config.api, model.get());
        });

    this.refresh = () => {
        this.configModelPromise = new ConfigModel('get');

        return this.init();
    };

    this.get = key => _.get(this.config, key);
    this.has = key => _.has(this.config, key);
}

ConfigService.$inject = ['CONFIG', 'ConfigModel'];

export default ConfigService;
