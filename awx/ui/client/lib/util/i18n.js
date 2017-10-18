import { join } from 'path';

import config from '~util/config';

const DEFAULT_LOCALE = config.get('ui.i18n.default');
const SUPPORTED_LOCALES = config.get('ui.i18n.supported');
const STATIC_PATH = join(config.get('ui.path.static'), 'languages');

/**
 * GET the localized JSON strings file or fall back to the default language
 * if the locale isn't supported or if the request fails.
 *
 * @argument {function} - Callback.
 *
 * @returns {object=} - Locale data if it exists.
 */
function init () {
    return requestLocale()
        .then(locale => {
            angular.module('I18N').constant('LOCALE', locale);
        });
}

function requestLocale () {
    return new Promise(resolve => {
        const code = getNormalizedLocaleCode();

        if (isDefaultLocale(code) || !isSupportedLocale(code)) {
            resolve({ code });

            return;
        }

        const request = $.ajax(`${STATIC_PATH}/${code}.json`);

        request.done(res => {
            if (res[code]) {
                resolve({ code, strings: res[code] });
            } else {
                resolve({ code: DEFAULT_LOCALE });
            }
        });

        request.fail(() => resolve({ code: DEFAULT_LOCALE }));
    });
}

/**
 * Grabs the language off of navigator for browser compatibility.
 * If the language isn't set, then it falls back to the DEFAULT_LOCALE. The
 * locale code is normalized to be lowercase and 2 characters in length.
 */
function getNormalizedLocaleCode () {
    let code;

    if (navigator.languages && navigator.languages[0]) {
        [code] = navigator.languages;
    } else if (navigator.language) {
        code = navigator.language;
    } else {
        code = navigator.userLanguage;
    }

    try {
        code = code.split('-')[0].toLowerCase();
    } catch (error) {
        code = DEFAULT_LOCALE;
    }

    return code.substring(0, 2);
}

function isSupportedLocale (code) {
    return SUPPORTED_LOCALES.includes(code);
}

function isDefaultLocale (code) {
    return code === DEFAULT_LOCALE;
}

export default {
    init
};
