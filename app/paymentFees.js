'use strict';

const router = require('express').Router();
const {getAllApplicationFees, getAllCopiesFees, calculatePaymentFees} = require('app/middleware/paymentFees');

router.get('/start-eligibility', (req, res, next) => getAllApplicationFees(req, res, next));
router.get('/start-eligibility', (req, res, next) => getAllCopiesFees(req, res, next));
router.get('/payment-breakdown', (req, res, next) => calculatePaymentFees(req, res, next));

module.exports = router;
