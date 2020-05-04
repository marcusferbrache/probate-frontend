'use strict';

const pageUnderTest = require('app/steps/ui/copies/summary');

module.exports = function() {
    const I = this;

    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    I.navByClick('.govuk-button');
};
