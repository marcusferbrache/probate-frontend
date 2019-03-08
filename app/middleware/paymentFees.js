'use strict';

const config = require('app/config');
const FeesCalculator = require('app/utils/FeesCalculator');

const calculatePaymentFees = (req, res, next) => {
    const session = req.session;
    const formdata = session.form;
    const feesCalculator = new FeesCalculator(config.services.feesRegister.url, session.id);

    feesCalculator.calc(formdata, req.authToken)
        .then((fees) => {
            formdata.fees = fees;
            session.form = formdata;
            next();
        });
};

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

const getAllCopiesFees = (req, res, next) => {
    const session = req.session;
    const formdata = session.form;
    const feesCalculator = new FeesCalculator(config.services.feesRegister.url, session.id);

    feesCalculator.getCopiesFees()
        .then((fees) => {
            formdata.allCopiesFees = fees;
            session.form = formdata;
            next();
        });
};

module.exports = {
    calculatePaymentFees,
    getAllApplicationFees,
    getAllCopiesFees
};
