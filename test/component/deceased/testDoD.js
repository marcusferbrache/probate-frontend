'use strict';

const TestWrapper = require('test/util/TestWrapper');
const DeceasedDob = require('app/steps/ui/deceased/dob/index');
const testHelpBlockContent = require('test/component/common/testHelpBlockContent.js');

describe('deceased-dod', () => {
    let testWrapper;
    const expectedNextUrlForDeceasedDob = DeceasedDob.getUrl();

    beforeEach(() => {
        testWrapper = new TestWrapper('DeceasedDod');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        testHelpBlockContent.runTest('WillLeft');

        it('test right content loaded on the page', (done) => {
            testWrapper.testContent(done, []);
        });

        it('test error message displayed for missing data', (done) => {
            const errorsToTest = ['dod_day', 'dod_month', 'dod_year'];
            const data = {};

            testWrapper.testErrors(done, data, 'required', errorsToTest);
        });

        it('test error message displayed for invalid date', (done) => {
            const errorsToTest = ['dod_date'];
            const data = {dod_day: '31', dod_month: '9', dod_year: '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);

        });

        it('test error message displayed for non-numeric field', (done) => {
            const errorsToTest = ['dod_day'];
            const data = {dod_day: 'ab', dod_month: '09', dod_year: '2000'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for three digits in year field', (done) => {
            const errorsToTest = ['dod_year'];
            const data = {dod_day: '12', dod_month: '9', dod_year: '200'};

            testWrapper.testErrors(done, data, 'invalid', errorsToTest);
        });

        it('test error message displayed for date in the future', (done) => {
            const errorsToTest = ['dod_date'];
            const data = {
                dod_day: '12',
                dod_month: '9',
                dod_year: '3000'
            };

            testWrapper.testErrors(done, data, 'dateInFuture', errorsToTest);
        });

        it('test error message displayed for DoD before DoB', (done) => {
            const errorsToTest = ['dod_date'];
            const sessionData = {
                deceased: {
                    dob_day: '12',
                    dob_month: '9',
                    dob_year: '2002'
                }
            };
            const data = {
                dod_day: '01',
                dod_month: '01',
                dod_year: '2000'
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    testWrapper.testErrors(done, data, 'dodBeforeDob', errorsToTest);
                });
        });

        it(`test it redirects to deceased dob: ${expectedNextUrlForDeceasedDob}`, (done) => {
            const data = {
                dod_day: '01',
                dod_month: '01',
                dod_year: '2000'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForDeceasedDob);
        });

    });
});
