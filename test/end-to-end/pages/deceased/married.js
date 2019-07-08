'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/deceased/married');

module.exports = (answer) => {
    const I = this;
    I.amOnLoadedPage(pageUnderTest.getUrl());
    I.click(`#married-option${answer}`);

    I.navByClick(commonContent.saveAndContinue);
};
