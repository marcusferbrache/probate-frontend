'use strict';

const ValidationStep = require('app/core/steps/ValidationStep');
const content = require('app/resources/en/translation/deceased/domicile');

class DeceasedDomicile extends ValidationStep {

    static getUrl() {
        return '/deceased-domicile';
    }

    nextStepUrl(ctx) {
        return this.next(ctx).constructor.getUrl('notInEnglandOrWales');
    }

    nextStepOptions() {
        return {
            options: [
                {key: 'domicile', value: content.optionYes, choice: 'inEnglandOrWales'}
            ]
        };
    }
}

module.exports = DeceasedDomicile;
