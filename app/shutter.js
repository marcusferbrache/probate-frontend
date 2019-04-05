'use strict';

const router = require('express').Router();
const FeatureToggle = require('app/utils/FeatureToggle');
const featureToggle = new FeatureToggle();

router.get(/\b(?!offline)\b\S+/g, (req, res, next) => featureToggle.callCheckToggle(req, res, next, 'fe_shutter_toggle', featureToggle.toggleExistingPage, 'offline'));

module.exports = router;
