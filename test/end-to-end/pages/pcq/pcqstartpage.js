'use strict';

module.exports = function() {
    const I = this;
    I.click({css: '.govuk-button.govuk-button--secondary'});
    I.wait(3);
    console.log('PCQ completed');
};
