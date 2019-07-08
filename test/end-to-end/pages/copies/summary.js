'use strict';

const pageUnderTest = require('app/steps/ui/copies/summary');

module.exports = () => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());

    I.navByClick('.button');
};
