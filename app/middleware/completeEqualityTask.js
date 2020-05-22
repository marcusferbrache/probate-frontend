'use strict';

const config = require('config');
const get = require('lodash').get;
const ServiceMapper = require('app/utils/ServiceMapper');
const uuidv4 = require('uuid/v4');
const Healthcheck = require('app/utils/Healthcheck');
const logger = require('app/components/logger')('Init');

const completeEqualityTask = (params) => {
    const formData = ServiceMapper.map(
        'FormData',
        [config.services.orchestrator.url, params.req.sessionID]
    );

    if (params.isEnabled && !get(params.req.session.form, 'equality.pcqId', false)) {
        const healthcheck = new Healthcheck();
        const service = {
            name: config.services.equalityAndDiversity.name,
            url: config.services.equalityAndDiversity.url,
            gitCommitIdPath: config.services.equalityAndDiversity.gitCommitIdPath
        };

        healthcheck.getServiceHealth(service)
            .then(json => {
                params.req.session.equalityHealth = json.status;
                logger.info(config.services.equalityAndDiversity.name, 'is', params.req.session.equalityHealth);

                if (params.req.session.equalityHealth === 'UP') {
                    params.req.session.form.equality = {
                        pcqId: uuidv4()
                    };

                    formData.post(params.req.authToken, params.req.session.serviceAuthorization, params.req.session.form.ccdCase.id, params.req.session.form);

                    params.next();
                } else {
                    pcqDown(params, formData);
                }
            });
    } else {
        pcqDown(params, formData);
    }
};

const pcqDown = (params, formData) => {
    formData.post(params.req.authToken, params.req.session.serviceAuthorization, params.req.session.form.ccdCase.id, params.req.session.form);

    if (params.req.session.caseType === 'intestacy') {
        params.res.redirect('/summary');
    } else {
        params.res.redirect('/task-list');
    }
};

module.exports = completeEqualityTask;
