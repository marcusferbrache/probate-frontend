'use strict';

const config = require('app/config');
const FeesCalculator = require('app/utils/FeesCalculator');
const FeatureToggle = require('app/utils/FeatureToggle');

const calculatePaymentFees = (req, res, next) => {
    const session = req.session;
    const formdata = session.form;
    const feesCalculator = new FeesCalculator(config.services.feesRegister.url, session.id);
    const newFeesToggle = FeatureToggle.isEnabled(req.session.featureToggles, 'fees_api');

    feesCalculator.calc(formdata, req.authToken, newFeesToggle)
        .then((fees) => {
            formdata.fees = fees;
            session.form = formdata;
            next();
        });
};

module.exports = calculatePaymentFees;
