const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;
const pageUnderTest = require('app/steps/ui/equality');

function completeEqualityQuestions() {
    const I = this;
    console.log('current page URL' + pageUnderTest.getUrl());
    I.seeCurrentUrlEquals(pageUnderTest.getUrl());
    I.click('//button[text()[contains(., "I don\'t want to answer these questions")]]');
    I.wait(3);
}

async function completeEquality() {
    const I = this;

    I.wait(3);
    const url = await I.grabCurrentUrl();

    if (url.startsWith(pcqAAT)) {
        I.seeCurrentUrlEquals(pagePath);

        await I.navByClick('I don\'t want to answer these questions');
        I.wait(5);
    }
}

module.exports = {
    completeEqualityQuestions,
    completeEquality
};
