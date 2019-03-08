'use strict';

const router = require('express').Router();
const getAllApplicationFees = require('app/middleware/getAllApplicationFees');
const calculatePaymentFees = require('app/middleware/calculatePaymentFees');

router.get('/start-eligibility', (req, res, next) => getAllApplicationFees(req, res, next));
router.get('/payment-breakdown', (req, res, next) => calculatePaymentFees(req, res, next));

module.exports = router;
