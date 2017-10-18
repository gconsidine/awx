import i18n from '~util/i18n';
import config from '~util/config';

/**
 * The Angular app is manually initialized in order to complete some
 * asynchronous work up front. Any promise supplied to the promises
 * array will resolve ahead of Angular loading. The bootstrap promise
 * won't resolve until the document is ready for Angular to start.
 */
function bootstrap () {
    const promises = [
        i18n.init(),
        config.init()
    ];

    return Promise.all(promises)
        .then(waitForDocument);
}

function waitForDocument () {
    return new Promise(resolve => {
        angular.element(document).ready(() => resolve());
    });
}

export default {
    bootstrap
};
