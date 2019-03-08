'use strict';

const expect = require('chai').expect;
const FormatCurrency = require('app/utils/FormatCurrency');

describe('FormatCurrency', () => {
    describe('format()', () => {
        it('should return a formatted currency when it\'s provided as a string and the value is less than 1', (done) => {
            const currency = '0.80';
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('80 pence');
            done();
        });

        it('should return a formatted currency when it\'s provided as a string', (done) => {
            const currency = '580000';
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('&pound;580,000');
            done();
        });

        it('should return a formatted currency when it\'s provided as a string and the value is greater than 1 million', (done) => {
            const currency = '1600000';
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('&pound;1.6 million');
            done();
        });

        it('should return a formatted currency when it\'s provided as a number and the value is less than 1', (done) => {
            const currency = 0.80;
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('80 pence');
            done();
        });

        it('should return a formatted currency when it\'s provided as a number', (done) => {
            const currency = 580000;
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('&pound;580,000');
            done();
        });

        it('should return a formatted currency when it\'s provided as a number and the value is greater than 1 million', (done) => {
            const currency = 1600000;
            const formattedCurrency = FormatCurrency.format(currency);
            expect(formattedCurrency).to.equal('&pound;1.6 million');
            done();
        });
    });
});
