'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/executors/names');

module.exports = function(totalExecutors) {
    const I = this;

    I.seeCurrentUrlEquals(pageUnderTest.getUrl());

    let i = 0;

    while (i < (parseInt(totalExecutors) - 1)) {
        I.fillField('#executorName_' + i, 'exec' + (i + 2));
        i += 1;
    }

    I.navByClick(commonContent.saveAndContinue);
};
