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
                'app/steps/ui/applicant/alias/index.js',
                'app/steps/ui/applicant/aliasreason/index.js',
                'app/steps/ui/applicant/name/index.js',
                'app/steps/ui/applicant/nameasonwill/index.js',
                'app/steps/ui/applicant/phone/index.js',
                'app/steps/ui/applicant/relationshiptodeceased/index.js',
                'app/steps/ui/applicant/spousenotapplyingreason/index.js'
            ],
        files: ['**/*'],
        maxConcurrentTestRunners: 2,
        symlinkNodeModules: false,
        htmlReporter: {baseDir: 'functional-output/mutation-applicant'},
        mochaOptions: {
            files:
                [
                    'test/unit/applicant/testApplicantAlias.js',
                    'test/unit/applicant/testApplicantAliasReason.js',
                    'test/component/applicant/testApplicantName.js',
                    'test/unit/applicant/testApplicantNameAsOnWill.js',
                    'test/component/applicant/testPhone.js',
                    'test/unit/applicant/testRelationshipToDeceased.js',
                    'test/unit/applicant/testSpouseNotApplyingReason.js'
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
