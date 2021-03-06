'use strict';

const commonContent = require('app/resources/en/translation/common');
const pageUnderTest = require('app/steps/ui/deceased/otherNames');

module.exports = function(noOfAliases) {
    const I = this;
    I.seeCurrentUrlEquals(pageUnderTest.getUrl());
    let i = 1;

    while (i <= noOfAliases) {
        if (i !== 1) {
            I.navByClick('Add another name');
        }

        I.fillField(`#otherNames_name_${i-1}_firstName`, `alias_firstnames_${i}`);
        I.fillField(`#otherNames_name_${i-1}_lastName`, `alias_lastnames_${i}`);

        i += 1;
    }

    I.navByClick(commonContent.saveAndContinue);
};
