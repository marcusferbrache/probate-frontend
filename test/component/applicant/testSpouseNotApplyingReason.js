'use strict';

const TestWrapper = require('test/util/TestWrapper');
const AnyOtherChildren = require('app/steps/ui/deceased/anyotherchildren/index');
const StopPage = require('app/steps/ui/stoppage/index');
const testHelpBlockContent = require('test/component/common/testHelpBlockContent.js');
const content = require('app/resources/en/translation/applicant/spousenotapplyingreason');

describe('spouse-not-applying-reason', () => {
    let testWrapper;
    const expectedNextUrlForAnyOtherChildren = AnyOtherChildren.getUrl();
    const expectedNextUrlForStopPage = StopPage.getUrl('spouseNotApplying');

    beforeEach(() => {
        testWrapper = new TestWrapper('SpouseNotApplyingReason');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        testHelpBlockContent.runTest('SpouseNotApplyingReason');

        it('test content loaded on the page', (done) => {
            const sessionData = {
                deceased: {
                    firstName: 'John',
                    lastName: 'Doe'
                }
            };

            testWrapper.agent.post('/prepare-session/form')
                .send(sessionData)
                .end(() => {
                    const contentData = {deceasedName: 'John Doe'};
                    testWrapper.testContent(done, [], contentData);
                });
        });

        it('test errors message displayed for missing data', (done) => {
            testWrapper.testErrors(done, {}, 'required', []);
        });

        it(`test it redirects to Any Other Children page if spouse renuncing: ${expectedNextUrlForAnyOtherChildren}`, (done) => {
            const data = {
                spouseNotApplyingReason: content.optionRenuncing
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForAnyOtherChildren);
        });

        it(`test it redirects to Any Other Children page if spouse not applying for other reasons: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                spouseNotApplyingReason: content.optionOther
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForStopPage);
        });
    });
});
