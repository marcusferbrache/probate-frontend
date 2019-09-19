'use strict';

const TestWrapper = require('test/util/TestWrapper');
const {assert} = require('chai');
const PinSent = require('app/steps/ui/pin/sent');
const commonContent = require('app/resources/en/translation/common');
const nock = require('nock');
const config = require('app/config');
const orchestratorServiceUrl = config.services.orchestrator.url;
const S2S_URL = config.services.idam.s2s_url;
const IDAM_URL = config.services.idam.apiUrl;
const afterEachNocks = (done) => {
    return () => {
        nock.cleanAll();
        done();
    };
};

describe('pin-resend', () => {
    let testWrapper;
    let sessionData;
    const expectedNextUrlForPinSent = PinSent.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('PinResend');

        sessionData = {
            ccdCase: {
                state: 'Draft',
                id: 1234567890123456
            }
        };

        nock(S2S_URL).post('/lease')
            .reply(200, 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJSRUZFUkVOQ0UifQ.Z_YYn0go02ApdSMfbehsLXXbxJxLugPG' +
                '8v_3ktCpQurK8tHkOy1qGyTo02bTdilX4fq4M5glFh80edDuhDJXPA');

        nock(IDAM_URL).post('/oauth2/authorize')
            .reply(200, {code: '12345'});

        nock(IDAM_URL).post('/oauth2/token')
            .reply(200, {'access_token': 'sdkfhdskhf'});
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test uk local phone number loads on the page', (done) => {
            const contentToExclude = ['subHeader2ExecName'];
            const contentData = {
                phoneNumber: '07701111111',
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.post('/prepare-session-field')
                        .send({
                            phoneNumber: '07701111111',
                            validLink: true
                        })
                        .then(() => {
                            testWrapper.testContent(done, contentData, contentToExclude);
                        });
                });
        });

        it('test uk phone number with int prefix loads on the page', (done) => {
            const contentToExclude = ['subHeader2ExecName'];
            const contentData = {
                phoneNumber: '+447701111111',
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.post('/prepare-session-field')
                        .send({
                            phoneNumber: '+447701111111',
                            validLink: true
                        })
                        .then(() => {
                            testWrapper.testContent(done, contentData, contentToExclude);
                        });
                });
        });

        it('test international long phone number loads on the page', (done) => {
            const contentToExclude = ['subHeader2ExecName'];
            const contentData = {
                phoneNumber: '+10900111000111000111',
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.post('/prepare-session-field')
                        .send({
                            phoneNumber: '+10900111000111000111',
                            validLink: true
                        })
                        .then(() => {
                            testWrapper.testContent(done, contentData, contentToExclude);
                        });
                });
        });

        it('test lead executor name loads on the page', (done) => {
            const contentToExclude = ['header1', 'header2'];
            const contentData = {
                executorName: 'Works',
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.agent.post('/prepare-session-field')
                        .send({
                            leadExecutorName: 'Works',
                            validLink: true
                        })
                        .then(() => {
                            testWrapper.testContent(done, contentData, contentToExclude);
                        });
                });
        });

        it(`test it redirects to next page: ${expectedNextUrlForPinSent}`, (done) => {
            nock(orchestratorServiceUrl)
                .get('/invite/pin?phoneNumber=undefined')
                .reply(200, '12345');

            testWrapper.testRedirect(afterEachNocks(done), {}, expectedNextUrlForPinSent);
        });

        it('test error page when pin resend fails', (done) => {
            nock(orchestratorServiceUrl)
                .get('/invite/pin?phoneNumber=undefined')
                .reply(500, new Error('ReferenceError'));

            const sessionData = require('test/data/multipleApplicant');

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    delete require.cache[require.resolve('test/data/multipleApplicant')];
                    testWrapper.agent.post(testWrapper.pageUrl)
                        .then(response => {
                            assert(response.status === 500);
                            assert(response.text.includes('having technical problems'));
                            nock.cleanAll();
                            done();
                        })
                        .catch(err => {
                            nock.cleanAll();
                            done(err);
                        });
                });
        });

        it('test "save and close" link is not displayed on the page', (done) => {
            const playbackData = {
                saveAndClose: commonContent.saveAndClose
            };

            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
