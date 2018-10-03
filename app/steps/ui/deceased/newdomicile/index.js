'use strict';

const ValidationStep = require('app/core/steps/ValidationStep');
const json = require('app/resources/en/translation/deceased/domicile');

module.exports = class NewDeceasedDomicile extends ValidationStep {

    static getUrl() {
        return '/new-deceased-domicile';
    }

    nextStepUrl(ctx) {
        return this.next(ctx).constructor.getUrl('notInEnglandOrWales');
    }

    nextStepOptions() {
        const nextStepOptions = {
            options: [
                {key: 'domicile', value: json.optionYes, choice: 'inEnglandOrWales'}
            ]
        };
        return nextStepOptions;
    }
};