'use strict';

const commonContent = require('app/resources/en/translation/common');

class FormatCurrency {
    static format(value) {
        if (value) {
            if (typeof value === 'string') {
                value = parseFloat(value);
            }

            if (typeof value === 'number') {
                if (value < 1) {
                    value *= 100;
                    value = `${value.toString()} ${commonContent.pence}`;
                } else if (value >= 1000000) {
                    value /= 1000000;
                    value = `&pound;${value.toString()} ${commonContent.million}`;
                } else {
                    value = `&pound;${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                }
            }

            return value;
        }

        return '';
    }
}

module.exports = FormatCurrency;
