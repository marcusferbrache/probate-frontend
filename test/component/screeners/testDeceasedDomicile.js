'use strict';

const config = require('app/config');
const TestWrapper = require('test/util/TestWrapper');
const IhtCompleted = require('app/steps/ui/screeners/ihtcompleted/index');
const StopPage = require('app/steps/ui/stoppage/index');
const commonContent = require('app/resources/en/translation/common');
const cookies = [{
    name: config.redis.eligibilityCookie.name,
    content: {
        nextStepUrl: '/deceased-domicile',
        pages: [
            '/death-certificate'
        ]
    }
}];

describe('deceased-domicile', () => {
    let testWrapper;
    const expectedNextUrlForIhtCompleted = IhtCompleted.getUrl();
    const expectedNextUrlForStopPage = StopPage.getUrl('notInEnglandOrWales');

    beforeEach(() => {
        testWrapper = new TestWrapper('DeceasedDomicile');
    });

    afterEach(() => {
        testWrapper.destroy();
    });

    describe('Verify Content, Errors and Redirection', () => {
        it('test help block content is loaded on page', (done) => {
            const playbackData = {};
            playbackData.helpTitle = commonContent.helpTitle;
            playbackData.helpText = commonContent.helpText;
            playbackData.contactTelLabel = commonContent.contactTelLabel.replace('{helpLineNumber}', config.helpline.number);
            playbackData.contactOpeningTimes = commonContent.contactOpeningTimes.replace('{openingTimes}', config.helpline.hours);
            playbackData.helpEmailLabel = commonContent.helpEmailLabel;
            playbackData.contactEmailAddress = commonContent.contactEmailAddress;

            testWrapper.testDataPlayback(done, playbackData, cookies);
        });

        it('test content loaded on the page', (done) => {
            testWrapper.testContent(done, [], {}, cookies);
        });

        it('test errors message displayed for missing data', (done) => {
            const data = {};

            testWrapper.testErrors(done, data, 'required', [], cookies);
        });

        it(`test it redirects to next page: ${expectedNextUrlForIhtCompleted}`, (done) => {
            const data = {
                domicile: 'Yes'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForIhtCompleted, cookies);
        });

        it(`test it redirects to stop page: ${expectedNextUrlForStopPage}`, (done) => {
            const data = {
                domicile: 'No'
            };

            testWrapper.testRedirect(done, data, expectedNextUrlForStopPage, cookies);
        });

        it('test save and close link is not displayed on the page', (done) => {
            const playbackData = {};
            playbackData.saveAndClose = commonContent.saveAndClose;

            testWrapper.testContentNotPresent(done, playbackData);
        });
    });
});
