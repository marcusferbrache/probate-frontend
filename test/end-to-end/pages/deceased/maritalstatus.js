'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/deceased/maritalstatus');

module.exports = () => {
    const I = this;
    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    I.click('#relationshipToDeceased');
    console.log('selectDeceasedMaritalStatus Method');
    I.navByClick(commonContent.saveAndContinue);
};
