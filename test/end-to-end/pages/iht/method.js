'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/iht/method');

module.exports = (answer) => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());

    I.click(`#method-option${answer}`);

    I.navByClick(commonContent.saveAndContinue);
};
