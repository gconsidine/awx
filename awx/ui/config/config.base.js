module.exports = {
    title: 'Ansible AWX',
    brand: 'AWX',
    log: 'info',
    path: {
        api: '/api/',
        static: global.STATIC_PATH || '/static/'
    },
    router: {
        debug: false,
    },
    i18n: {
        debug: false,
        default: 'en',
        supported: [
            'en',
            'es',
            'ja',
            'fr',
            'nl'
        ]
    },
    pendo: {
        key: ''
    }
};
