module.exports= function completePCQ () {
    const I = this;
    I.wait(2);
    I.click({css: '.govuk-button.govuk-button--secondary'});
    // I.click('I don\'t want to answer these questions');
};
