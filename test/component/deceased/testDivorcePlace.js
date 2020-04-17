'use strict';

const TestWrapper = require('test/util/TestWrapper');
const StopPage = require('app/steps/ui/stoppage');
const TaskList = require('app/steps/ui/tasklist');
const commonContent = require('app/resources/en/translation/common');
const contentMaritalStatus = require('app/resources/en/translation/deceased/maritalstatus');
const config = require('config');
const caseTypes = require('app/utils/CaseTypes');

describe('divorce-place', () => {
    let testWrapper;
    const expectedNextUrlForStopPage = StopPage.getUrl('divorcePlace');
    const expectedNextUrlForTaskList = TaskList.getUrl();
    const sessionData = {
        type: caseTypes.INTESTACY,
        ccdCase: {
            state: 'Pending',
            id: 1234567890123456
        },
        caseType: caseTypes.INTESTACY,
        deceased: {
            maritalStatus: 'optionDivorced'
        }
    };

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection - Webforms FT ON', () => {
        beforeEach(() => {
            testWrapper = new TestWrapper('DivorcePlace', {ft_webforms: true});
        });

        it('test webforms help block content is loaded on page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        helpHeadingOnlineForm: commonContent.helpHeadingOnlineForm,
                        sendUsAMessage: commonContent.helpSendUsAMessage.replace('{webForms}', config.links.webForms),
                        opensInNewWindow: commonContent.helpOpensInNewWindow,
                        responseTime: commonContent.helpResponseTime
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });
    });

    describe('Verify Content, Errors and Redirection - Webforms FT OFF', () => {
        beforeEach(() => {
            testWrapper = new TestWrapper('DivorcePlace');
        });

        it('test help block content is loaded on page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const playbackData = {
                        helpTitle: commonContent.helpTitle,
                        helpHeadingTelephone: commonContent.helpHeadingTelephone,
                        helpHeadingEmail: commonContent.helpHeadingEmail,
                        helpHeadingWebchat: commonContent.helpHeadingWebchat,
                        helpEmailLabel: commonContent.helpEmailLabel.replace(/{contactEmailAddress}/g, config.links.contactEmailAddress)
                    };

                    testWrapper.testDataPlayback(done, playbackData);
                });
        });

        it('test content loaded on the page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {legalProcess: contentMaritalStatus.divorce};

                    testWrapper.testContent(done, contentData);
                });
        });

        it('test errors message displayed for missing data', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        '{legalProcess}': 'divorce'
                    };

                    testWrapper.testErrors(done, data, 'required');
                });
        });

        it(`test it redirects to stop page: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                divorcePlace: 'optionNo'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testRedirect(done, data, expectedNextUrlForStopPage);
                });
        });

        it(`test it redirects to tasklist: ${expectedNextUrlForTaskList}`, (done) => {
            const data = {
                divorcePlace: 'optionYes'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testRedirect(done, data, expectedNextUrlForTaskList);
                });
        });
    });
});
