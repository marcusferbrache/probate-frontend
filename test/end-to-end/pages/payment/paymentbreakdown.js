'use strict';

const pageUnderTest = require('app/steps/ui/payment/breakdown');

module.exports = () => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());

    I.navByClick('.button');
};
