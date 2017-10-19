import _ from 'lodash';
import config from '~util/config';

function ConfigService (CONFIG, ConfigModel) {
    this.config = config.get();

    this.init = () => new ConfigModel('get')
        .then(model => {
            _.set(this.config, 'api.config', model.get());
        });

    this.refresh = () => config.init()
        .then(() => {
            this.config = config.get();

            return this.init();
        });

    this.get = key => _.get(this.config, key);
    this.has = key => _.has(this.config, key);
}

ConfigService.$inject = ['CONFIG', 'ConfigModel'];

export default ConfigService;
