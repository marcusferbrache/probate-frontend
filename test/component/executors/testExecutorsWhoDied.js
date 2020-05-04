'use strict';

const TestWrapper = require('test/util/TestWrapper');
const ExecutorsWhenDied = require('app/steps/ui/executors/whendied');
const testCommonContent = require('test/component/common/testCommonContent.js');
const caseTypes = require('app/utils/CaseTypes');

describe('executors-who-died', () => {
    let testWrapper, sessionData;
    const expectedNextUrlForExecsWhenDied = ExecutorsWhenDied.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('ExecutorsWhoDied');
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
                    {firstName: 'John', lastName: 'TheApplicant', isApplying: 'optionYes', isApplicant: true},
                    {fullName: 'Another Name'},
                    {fullName: 'Harvey Smith'}
                ]
            },
            executorName: ['many', 'harvey']
        };
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        testCommonContent.runTest('ExecutorsWhoDied', null, null, [], false, {type: caseTypes.GOP});

        it('test content loaded on the page', (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testContent(done);
                });
        });

        it('test errors message displayed for missing data', (done) => {
            const errorsToTest = ['executorsWhoDied'];
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testErrors(done, {}, 'required', errorsToTest);
                });
        });

        it(`test it redirects to next page: ${expectedNextUrlForExecsWhenDied}`, (done) => {
            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const data = {
                        executorsWhoDied: 'harvey smith'
                    };

                    testWrapper.testRedirect(done, data, expectedNextUrlForExecsWhenDied);
                });
        });
    });
});
