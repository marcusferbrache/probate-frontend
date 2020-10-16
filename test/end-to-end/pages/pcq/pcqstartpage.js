const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;

module.exports = function() {
    const I = this;
    I.wait(3);
    const url = I.grabCurrentUrl();
    console.log('Current Page URL::-->' + url);

    if (url.startsWith(pcqAAT)) {
        I.seeCurrentUrlEquals(pagePath);

        I.navByClick('I don\'t want to answer these questions');
        I.wait(3);
    }
};
