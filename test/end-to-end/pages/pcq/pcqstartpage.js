'use strict';

module.exports = function() {
    const I = this;
    I.click('#main-content > div > div > form > ul > li:nth-child(2) > button');
    I.wait(3);
    console.log('PCQ completed');
};
