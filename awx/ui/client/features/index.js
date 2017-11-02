import atLibServices from '~services';
import atLibComponents from '~components';
import atLibModels from '~models';

import atFeaturesCredentials from '~features/credentials';
import atFeaturesJobs from '~features/jobs';
import atFeaturesTemplates from '~features/templates';

const MODULE_NAME = 'at.features';

angular.module(MODULE_NAME, [
    atLibServices,
    atLibComponents,
    atLibModels,
    atFeaturesCredentials,
    atFeaturesJobs,
    atFeaturesTemplates
]);

export default MODULE_NAME;
