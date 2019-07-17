const strykerConfiguration = config => {
    config.set({
        testRunner: 'mocha',
        mutator: 'javascript',
        transpilers: [],
        reporter:
            [
                'clear-text',
                'progress',
                'html'
            ],
        testFramework: 'mocha',
        coverageAnalysis: 'perTest',
        mutate:
            [
                'app/steps/ui/deceased/address/index.js',
                'app/steps/ui/deceased/alias/index.js',
                'app/steps/ui/deceased/details/index.js',
                'app/steps/ui/deceased/dob/index.js',
                'app/steps/ui/deceased/dod/index.js',
                'app/steps/ui/deceased/maritalstatus/index.js',
                'app/steps/ui/deceased/married/index.js',
                'app/steps/ui/deceased/name/index.js'
            ],
        files: ['**/*'],
        maxConcurrentTestRunners: 2,
        symlinkNodeModules: false,
        htmlReporter: {baseDir: 'functional-output/mutation-deceased'},
        mochaOptions: {
            files:
                [
                    'test/unit/**/testDeceasedAddress.js',
                    'test/unit/**/testDeceasedAlias.js',
                    'test/unit/**/testDeceasedDetails.js',
                    'test/unit/**/testDeceasedDob.js',
                    'test/unit/**/testDeceasedDod.js',
                    'test/unit/**/testDeceasedMaritalStatus.js',
                    'test/unit/**/testDeceasedMarried.js',
                    'test/unit/**/testDeceasedName.js'
                ],
            timeout: 8000
        },
        logLevel: 'debug',
        plugins:
            [
                'stryker-mocha-runner',
                'stryker-mocha-framework',
                'stryker-javascript-mutator',
                'stryker-html-reporter'
            ]
    });
};

module.exports = strykerConfiguration;