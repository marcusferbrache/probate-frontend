'use strict';

const TestWrapper = require('test/util/TestWrapper');
const DeceasedDob = require('app/steps/ui/deceased/dob');
const testCommonContent = require('test/component/common/testCommonContent.js');
const caseTypes = require('app/utils/CaseTypes');

describe('deceased-name', () => {
    let testWrapper;
    const expectedNextUrlForDeceasedDob = DeceasedDob.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('DeceasedName');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        testCommonContent.runTest('DeceasedName', null, null, [], false, {type: caseTypes.GOP});

        it('test right content loaded on the page', (done) => {
            const sessionData = {
                type: caseTypes.GOP,
                ccdCase: {
                    state: 'Pending',
                    id: 1234567890123456
                }
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testContent(done);
                });
        });

        it('test errors message displayed for missing data', (done) => {
            testWrapper.testErrors(done, {}, 'required');
        });

        it('test errors message displayed for invalid firstName', (done) => {
            const errorsToTest = ['firstName'];
            const data = {
                firstName: '>dee',
                lastName: 'ceased'
            };
            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test errors message displayed for invalid lastName', (done) => {
            const errorsToTest = ['lastName'];
            const data = {
                firstName: 'dee',
                lastName: '>ceased'
            };
            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it(`test it redirects to Deceased Date of Birth page: ${expectedNextUrlForDeceasedDob}`, (done) => {
            const data = {
                firstName: 'Bob',
                lastName: 'Smith'
            };
            testWrapper.testRedirect(done, data, expectedNextUrlForDeceasedDob);
        });
    });
});
