'use strict';

const pageUnderTest = require('app/steps/ui/summary');

module.exports = (redirect) => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl(redirect));

    I.downloadPdfIfNotIE11('#checkAnswerHref');

    I.navByClick('.button');
};
