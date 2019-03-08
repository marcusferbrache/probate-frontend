'use strict';

const Step = require('app/core/steps/Step');
const featureToggle = require('app/utils/FeatureToggle');
const FormatCurrency = require('app/utils/FormatCurrency');

class StartEligibility extends Step {

    static getUrl() {
        return '/start-eligibility';
    }

    handleGet(ctx, formdata, featureToggles) {
        ctx.isFeesApiToggleEnabled = featureToggle.isEnabled(featureToggles, 'fees_api');

        if (ctx.isFeesApiToggleEnabled) {
            ctx.allApplicationFees = formdata.allApplicationFees.fees;

            ctx.allApplicationFees.forEach((fee) => {
                fee.min = FormatCurrency.format(fee.min);
                fee.max = FormatCurrency.format(fee.max);
                fee.amount = FormatCurrency.format(fee.amount);
            });
        }

        return [ctx];
    }
}

module.exports = StartEligibility;
