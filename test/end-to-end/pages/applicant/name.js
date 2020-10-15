'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/applicant/name');
const TestConfigurator = new (require('test/end-to-end/helpers/TestConfigurator'))();

module.exports = function(firstname, lastname) {
    const I = this;
    console.log('Current Page URL:-->' + TestConfigurator.getCurrentUrl());
    console.log('current url:-->'+ pageUnderTest.getUrl());
    I.wait(2);
    I.seeCurrentUrlEquals(pageUnderTest.getUrl());
    I.fillField('#firstName', firstname);
    I.fillField('#lastName', lastname);

    I.navByClick(commonContent.saveAndContinue);
};
