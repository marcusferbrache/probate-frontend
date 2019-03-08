'use strict';

const router = require('express').Router();
const calculatePaymentFees = require('app/middleware/calculatePaymentFees');

router.get('/start-eligibility', (req, res, next) => getApplicationFees(req, res, next));
router.get('/payment-breakdown', (req, res, next) => calculatePaymentFees(req, res, next));

module.exports = router;
