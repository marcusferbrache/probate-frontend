'use strict';

const pageUnderTest = require('app/steps/ui/pin/signin');

module.exports = (pinCode) => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());

    I.fillField('#pin', pinCode);

    I.navByClick('.button');
};
