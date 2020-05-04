'use strict';

const TestWrapper = require('test/util/TestWrapper');
const ExecutorContactDetails = require('app/steps/ui/executors/contactdetails');
const ExecutorCurrentName = require('app/steps/ui/executors/currentname');
const caseTypes = require('app/utils/CaseTypes');

describe('/executor-current-name-reason/', () => {
    let testWrapper, sessionData;
    const expectedNextUrlForExecContactDetails = ExecutorContactDetails.getUrl();
    const firstNameReasonUrl = ExecutorCurrentName.getUrl(2);

    beforeEach(() => {
        testWrapper = new TestWrapper('ExecutorCurrentNameReason');
        sessionData = {
            type: caseTypes.GOP,
            ccdCase: {
                state: 'Pending',
                id: 1234567890123456
            },
            executors: {
                list: [
                    {firstName: 'John', lastName: 'TheApplicant', isApplying: true, isApplicant: true},
                    {fullName: 'Executor Name1', isApplying: false},
                    {fullName: 'Executor Name2', isApplying: true, currentName: 'Name2 Executor', hasOtherName: true},
                    {fullName: 'Executor Name3', isApplying: true, hasOtherName: false},
                    {fullName: 'Executor Name4', isApplying: true, hasOtherName: true},
                    {fullName: 'Executor Name5', isApplying: false},
                    {fullName: 'Executor Name6', isApplying: false}
                ]
            }
        };
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test content loaded on the page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {
                        executorFullName: 'Executor Name2',
                        executorName: 'Name2 Executor'
                    };

                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(2);
                    testWrapper.testContent(done, contentData);
                });
        });

        it('test alias reason validation when no data is entered', (done) => {
            const errorsToTest = ['currentNameReason'];

            testWrapper.testErrors(done, {}, 'required', errorsToTest);
        });

        it('test alias reason validation when other is selected but no reason is entered', (done) => {
            const errorsToTest = ['otherReason'];
            const data = {
                currentNameReason: 'optionOther',
                otherReason: ''
            };

            testWrapper.testErrors(done, data, 'required', errorsToTest);
        });

        it(`test redirects from ExecutorCurrentNameReason to next ExecutorCurrentName, ${firstNameReasonUrl}`, (done) => {
            sessionData.declaration = {
                declarationCheckbox: 'true',
                hasDataChanged: false
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 1,
                        currentNameReason: 'Marriage'
                    };

                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(1);
                    testWrapper.testRedirect(done, data, firstNameReasonUrl);
                });
        });

        it(`test it redirects last executor to Executor Contact Details step: ${expectedNextUrlForExecContactDetails}`, (done) => {
            sessionData.declaration = {
                declarationCheckbox: 'true',
                hasDataChanged: false
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        index: 4,
                        currentNameReason: 'Marriage',
                    };

                    testWrapper.pageUrl = testWrapper.pageToTest.constructor.getUrl(4);
                    testWrapper.testRedirect(done, data, expectedNextUrlForExecContactDetails);
                });
        });
    });
});
