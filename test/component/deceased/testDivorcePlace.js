'use strict';

const TestWrapper = require('test/util/TestWrapper');
const StopPage = require('app/steps/ui/stoppage');
const TaskList = require('app/steps/ui/tasklist');
const commonContent = require('app/resources/en/translation/common');
const contentMaritalStatus = require('app/resources/en/translation/deceased/maritalstatus');
const content = require('app/resources/en/translation/deceased/divorceplace');
const config = require('app/config');
const caseTypes = require('app/utils/CaseTypes');
const nock = require('nock');
const featureToggleUrl = config.featureToggles.url;
const intestacyQuestionsFeatureTogglePath = `${config.featureToggles.path}/${config.featureToggles.intestacy_questions}`;
const webchatFeatureTogglePath = `${config.featureToggles.path}/${config.featureToggles.webchat}`;
const webformsFeatureTogglePath = `${config.featureToggles.path}/${config.featureToggles.webforms}`;
const featureTogglesNockIntestacyQuestions = (status = 'true') => {
    nock(featureToggleUrl)
        .get(intestacyQuestionsFeatureTogglePath)
        .reply(200, status);
};
const featureTogglesNockWebchat = (status = 'true') => {
    nock(featureToggleUrl)
        .get(webchatFeatureTogglePath)
        .reply(200, status);
};
const featureTogglesNockWebforms = (status = 'true') => {
    nock(featureToggleUrl)
        .get(webformsFeatureTogglePath)
        .reply(200, status);
};

describe('divorce-place', () => {
    let testWrapper;
    const expectedNextUrlForStopPage = StopPage.getUrl('divorcePlace');
    const expectedNextUrlForTaskList = TaskList.getUrl();
    const sessionData = {
        caseType: caseTypes.INTESTACY,
        deceased: {
            maritalStatus: contentMaritalStatus.optionDivorced
        }
    };

    beforeEach(() => {
        testWrapper = new TestWrapper('DivorcePlace');
        featureTogglesNockIntestacyQuestions();
    });

    afterEach(() => {
        testWrapper.destroy();
        nock.cleanAll();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test help block content is loaded on page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        helpTitle: commonContent.helpTitle,
                        helpHeadingTelephone: commonContent.helpHeadingTelephone,
                        helpHeadingEmail: commonContent.helpHeadingEmail,
                        helpEmailLabel: commonContent.helpEmailLabel.replace(/{contactEmailAddress}/g, config.links.contactEmailAddress)
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });

        it('test webchat help block content is loaded on page', (done) => {
            featureTogglesNockWebchat();

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        helpHeadingWebchat: commonContent.helpHeadingWebchat,
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });

        it('test webforms help block content is loaded on page', (done) => {
            featureTogglesNockWebforms();

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        helpHeadingOnlineForm: commonContent.helpHeadingOnlineForm,
                        sendUsAMessage: commonContent.sendUsAMessage.replace('{webForms}', config.links.webForms),
                        opensInNewWindow: commonContent.opensInNewWindow,
                        responseTime: commonContent.responseTime
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });

        it('test content loaded on the page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {legalProcess: contentMaritalStatus.divorce};

                    testWrapper.testContent(done, [], contentData);
                });
        });

        it('test errors message displayed for missing data', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const replacementData = {
                        '{legalProcess}': 'divorce'
                    };
                    testWrapper.testErrors(done, replacementData, 'required', []);
                });
        });

        it(`test it redirects to stop page: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                divorcePlace: content.optionNo
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testRedirect(done, data, expectedNextUrlForStopPage);
                });
        });

        it(`test it redirects to tasklist: ${expectedNextUrlForTaskList}`, (done) => {
            const data = {
                divorcePlace: content.optionYes
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testRedirect(done, data, expectedNextUrlForTaskList);
                });
        });
    });
});
