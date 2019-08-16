'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/screeners/deathcertificate');

module.exports = (answer) => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());
    I.click(`#deathCertificate-option${answer}`);

    I.navByClick(commonContent.continue);
};
