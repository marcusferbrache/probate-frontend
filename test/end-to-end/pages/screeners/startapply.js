'use strict';

const pageUnderTest = require('app/steps/ui/screeners/startapply');

module.exports = () => {
    const I = this;

    I.amOnLoadedPage(pageUnderTest.getUrl());

    I.navByClick('.button');

};
