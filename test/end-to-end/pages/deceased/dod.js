'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/deceased/dod');

module.exports = function(day, month, year) {
    const I = this;
    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    I.fillField('#dod-day', day);
    I.fillField('#dod-month', month);
    I.fillField('#dod-year', year);

    I.navByClick(commonContent.saveAndContinue);
};
