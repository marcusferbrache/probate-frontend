'use strict';

const config = require('app/config');
const Step = require('app/core/steps/Step');
const featureToggle = require('app/utils/FeatureToggle');
const FeesCalculator = require('app/utils/FeesCalculator');

class StartEligibility extends Step {

    static getUrl() {
        return '/start-eligibility';
    }

    * handleGet(ctx, formdata, featureToggles) {
        ctx.isFeesApiToggleEnabled = featureToggle.isEnabled(featureToggles, 'fees_api');

        if (ctx.isFeesApiToggleEnabled) {
            const feesCalculator = new FeesCalculator(config.services.feesRegister.url, ctx.sessionID);
            const applicationFees = yield feesCalculator.getApplicationFees(config.services.feesRegister.applicationFeeCodes);
            ctx.fees = applicationFees.fees;

            console.log('CTX.FEES: ', ctx.fees);
        }

        return [ctx];
    }
}

module.exports = StartEligibility;
