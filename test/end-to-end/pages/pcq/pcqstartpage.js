const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;

module.exports = function completeEquality() {
    const I = this;
    I.wait(3);
    const url = I.grabCurrentUrl();

    if (url.startsWith(pcqAAT)) {
        I.seeCurrentUrlEquals(pagePath);

        I.navByClick('I don\'t want to answer these questions');
        I.wait(3);
    }
};
