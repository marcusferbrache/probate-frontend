'use strict';

const TestWrapper = require('test/util/TestWrapper');
const ExecutorContactDetails = require('app/steps/ui/executors/contactdetails');
const ExecutorAddress = require('app/steps/ui/executors/address');
const commonContent = require('app/resources/en/translation/common');
const config = require('config');
const caseTypes = require('app/utils/CaseTypes');

describe('executors-contact-details', () => {
    let testWrapper, sessionData;
    const expectedNextUrlForExecAddress = ExecutorAddress.getUrl(1);

    beforeEach(() => {
        sessionData = {
            type: caseTypes.GOP,
            ccdCase: {
                state: 'Pending',
                id: 1234567890123456
            },
            applicant: {
                firstName: 'John',
                lastName: 'TheApplicant'
            },
            executors: {
                executorsNumber: 3,
                list: [
                    {fullName: 'John', isApplying: true, isApplicant: true},
                    {fullName: 'Other Applicant', isApplying: true, isApplicant: true},
                    {fullName: 'Harvey', isApplying: true, isApplicant: true}
                ]
            }
        };
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection - Webforms FT ON', () => {
        beforeEach(() => {
            testWrapper = new TestWrapper('ExecutorContactDetails', {ft_webforms: true});
        });

        it('test webforms help block content is loaded on page', (done) => {
            testWrapper.pageUrl = ExecutorContactDetails.getUrl(1);
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
            testWrapper = new TestWrapper('ExecutorContactDetails');
        });

        it('test help block content is loaded on page', (done) => {
            testWrapper.pageUrl = ExecutorContactDetails.getUrl(1);
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

        it('test correct content is loaded on the page', (done) => {
            testWrapper.pageUrl = ExecutorContactDetails.getUrl(1);
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        executorName: 'Other Applicant'
                    };

                    testWrapper.testContent(done, contentData);
                });
        });

        it('test error messages displayed if no data entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const errorsToTest = ['email', 'mobile'];
                    const data = {
                        index: 1,
                        email: '',
                        mobile: ''
                    };

                    testWrapper.testErrors(done, data, 'required', errorsToTest);
                });
        });

        it('test error messages displayed if no email entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        executorName: 'Other Applicant',
                        email: '',
                        mobile: '07336622022'
                    };
                    const errorsToTest = ['email'];

                    testWrapper.testErrors(done, data, 'required', errorsToTest);
                });
        });

        it('test error messages displayed if no mobile number entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        executorName: 'Other Applicant',
                        email: 'test@hotmail.com',
                        mobile: ''
                    };
                    const errorsToTest = ['mobile'];

                    testWrapper.testErrors(done, data, 'required', errorsToTest);
                });
        });

        it('test error messages displayed if invalid email entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        executorName: 'Other Applicant',
                        email: 'test@.com',
                        mobile: '+447663382082'
                    };
                    const errorsToTest = ['email'];

                    testWrapper.testErrors(done, data, 'invalid', errorsToTest);
                });
        });

        it('test error messages displayed if invalid mobile number entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        executorName: 'Other Applicant',
                        email: 'test@hotmail.com',
                        mobile: '+rr53t6463'
                    };
                    const errorsToTest = ['mobile'];

                    testWrapper.testErrors(done, data, 'invalid', errorsToTest);
                });
        });

        it('test error messages displayed if invalid data entered', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        executorName: 'Other Applicant',
                        email: 'b@.m',
                        mobile: '075r5r5r5r'
                    };

                    testWrapper.testErrors(done, data, 'invalid');
                });
        });

        it(`test it redirects to address page: ${expectedNextUrlForExecAddress}`, (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        executorName: 'Other Applicant',
                        email: 'test@hotmail.com',
                        mobile: '+447663382082'
                    };

                    testWrapper.testRedirect(done, data, expectedNextUrlForExecAddress);
                });
        });
    });
});
