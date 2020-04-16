const config = require('@hmcts/properties-volume').addTo(require('config'));
const {get, set} = require('lodash');

const setSecret = (secretPath, configPath) => {
    if (config.has(secretPath)) {
        set(config, configPath, get(config, secretPath));
    }
};

const setupSecrets = () => {
    if (config.has('secrets.probate')) {
        setSecret('secrets.probate.frontend-redis-access-key', 'redis.password');
        setSecret('secrets.probate.idam-s2s-secret', 'services.idam.service_key');
        setSecret('secrets.probate.ccidam-idam-api-secrets-probate', 'services.idam.probate_oauth2_secret');
        setSecret('secrets.probate.postcode-service-url', 'services.postcode.serviceUrl');
        setSecret('secrets.probate.postcode-service-token2', 'services.postcode.token');
        setSecret('secrets.probate.probate-survey', 'links.survey');
        setSecret('secrets.probate.probate-survey-end', 'links.surveyEndOfApplication');
        setSecret('secrets.probate.probate-application-fee-code', 'payment.applicationFeeCode');
        setSecret('secrets.probate.probate-uk-application-fee-code', 'payment.copies.uk.code');
        setSecret('secrets.probate.probate-overseas-application-fee-code', 'payment.copies.overseas.code');
        setSecret('secrets.probate.probate-service-id', 'payment.serviceId');
        setSecret('secrets.probate.probate-site-id', 'payment.siteId');
        setSecret('secrets.probate.payCaseWorkerUser', 'services.idam.probate_user_email');
        setSecret('secrets.probate.payCaseWorkerPass', 'services.idam.probate_user_password');
        setSecret('secrets.probate.probate-webchat-id', 'webChat.chatId');
        setSecret('secrets.probate.probate-webchat-tenant', 'webChat.tenant');
        setSecret('secrets.probate.probate-webchat-button-no-agents', 'webChat.buttonNoAgents');
        setSecret('secrets.probate.probate-webchat-button-busy', 'webChat.buttonAgentsBusy');
        setSecret('secrets.probate.probate-webchat-button-service-closed', 'webChat.buttonServiceClosed');
        setSecret('secrets.probate.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
        setSecret('secrets.probate.google-analytics-tracking-id', 'gaTrackingId');
        setSecret('secrets.probate.launchdarkly-key', 'featureToggles.launchDarklyKey');
    }
};

module.exports = setupSecrets;
