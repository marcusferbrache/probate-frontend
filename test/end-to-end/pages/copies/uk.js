'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/copies/uk');

module.exports = (copies) => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());
    I.fillField('#uk', copies);

    I.navByClick(commonContent.saveAndContinue);
};
