'use strict';

const ValidationStep = require('app/core/steps/ValidationStep');
const content = require('app/resources/en/translation/deceased/maritalstatus');

class DivorcePlace extends ValidationStep {

    static getUrl() {
        return '/deceased-divorce-place';
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form;
        ctx.legalProcess = formdata.deceased.maritalStatus === content.optionDivorced ? content.divorce : content.separation;
        return ctx;
    }

    nextStepUrl(ctx) {
        return this.next(ctx).constructor.getUrl('divorcePlace');
    }

    nextStepOptions() {
        return {
            options: [
                {key: 'divorcePlace', value: content.optionYes, choice: 'inEnglandOrWales'},
            ]
        };
    }
}

module.exports = DivorcePlace;
