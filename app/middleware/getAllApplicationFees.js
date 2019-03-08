'use strict';

const config = require('app/config');
const FeesCalculator = require('app/utils/FeesCalculator');

const getAllApplicationFees = (req, res, next) => {
    const session = req.session;
    const formdata = session.form;
    const feesCalculator = new FeesCalculator(config.services.feesRegister.url, session.id);

    feesCalculator.getApplicationFees(config.services.feesRegister.applicationFeeCodes)
        .then((fees) => {
            formdata.allApplicationFees = fees;
            session.form = formdata;
            next();
        });
};

module.exports = getAllApplicationFees;
