'use strict';

module.exports = function() {
    const I = this;
    I.click('.govuk-button.govuk-button--secondary');
    I.wait(3);
    console.log('PCQ completed');
};
