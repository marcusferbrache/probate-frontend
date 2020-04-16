'use strict';

const router = require('express').Router();
const FeatureToggle = require('app/utils/FeatureToggle');
const featureToggle = new FeatureToggle();

router.get('/*', (req, res, next) => featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_webforms', featureToggle.toggleFeature));

router.get('/start-eligibility', (req, res, next) => featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_fees_api', featureToggle.toggleFeature));
router.get('/copies-uk', (req, res, next) => featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_fees_api', featureToggle.toggleFeature));
router.get('/copies-overseas', (req, res, next) => featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_fees_api', featureToggle.toggleFeature));
router.all('/payment-breakdown', (req, res, next) => featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_fees_api', featureToggle.toggleFeature));

module.exports = router;
