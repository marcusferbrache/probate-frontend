'use strict';

const config = require('app/config');
const logger = require('app/components/logger')('Init');
const ServiceMapper = require('app/utils/ServiceMapper');
const caseTypes = require('app/utils/CaseTypes');
const contentWillLeft = require('app/resources/en/translation/screeners/willleft');

const initDashboard = (req, res, next) => {
    const session = req.session;
    const formdata = session.form;
    const formData = ServiceMapper.map(
        'FormData',
        [config.services.orchestrator.url, req.sessionID]
    );

    formData.getAll(req.authToken, req.session.serviceAuthorization)
        .then(result => {
            if (result.applications && result.applications.length) {
                if (formdata.screeners && formdata.screeners.left) {
                    if (!result.applications.some(application => application.ccdCase.state === 'Draft' && !application.deceasedFullName && application.caseType === caseTypes.getProbateType(formdata.caseType))) {
                        let eligibilityQuestionsList = config.eligibilityQuestionsProbate;
                        if (formdata.screeners.left === contentWillLeft.optionNo) {
                            eligibilityQuestionsList = config.eligibilityQuestionsIntestacy;
                        }

                        if (formdata.screeners && eligibilityQuestionsList.every(item => Object.keys(formdata.screeners).indexOf(item) > -1)) {
                            cleanupSession(req.session, true);

                            formData.postNew(req.authToken, req.session.serviceAuthorization, req.session.form.caseType)
                                .then(result => {
                                    delete formdata.caseType;
                                    delete formdata.screeners;
                                    renderDashboard(req, result, next);
                                })
                                .catch(err => {
                                    logger.error(`Error while getting applications: ${err}`);
                                });
                        }
                    } else {
                        delete formdata.caseType;
                        delete formdata.screeners;
                        renderDashboard(req, result, next);
                    }
                } else {
                    delete formdata.caseType;
                    delete formdata.screeners;
                    renderDashboard(req, result, next);
                }
            } else {
                res.redirect('/start-eligibility');
            }
        })
        .catch(err => {
            logger.error(`Error while getting applications: ${err}`);
        });
};

const renderDashboard = (req, result, next) => {
    delete req.session.form.caseType;
    delete req.session.form.screeners;

    if (result.applications && result.applications.length) {
        cleanupSession(req.session);
    }

    req.session.form.applications = result.applications;
    next();
};

const getCase = (req, res) => {
    const session = req.session;

    let ccdCaseId = req.originalUrl.split('/')[2];
    if (ccdCaseId) {
        ccdCaseId = ccdCaseId.split('?')[0];
    }

    let probateType = req.originalUrl.split('/')[2];
    if (probateType) {
        probateType = probateType.split('?')[1];

        if (probateType) {
            probateType = probateType.split('=')[1];
        }
    }

    if (!probateType && req.session.form.caseType) {
        probateType = caseTypes.getProbateType(req.session.form.caseType);
    }

    if (ccdCaseId && probateType) {
        const formData = ServiceMapper.map(
            'FormData',
            [config.services.orchestrator.url, req.sessionID]
        );

        formData.get(req.authToken, req.session.serviceAuthorization, ccdCaseId, probateType)
            .then(result => {
                session.form = result;

                if (session.form.ccdCase.state === 'Draft' || session.form.ccdCase.state === 'PAAppCreated' || session.form.ccdCase.state === 'CasePaymentFailed') {
                    res.redirect('/task-list');
                } else {
                    res.redirect('/thank-you');
                }
            })
            .catch(err => {
                logger.error(`Error while getting the case: ${err}`);
                res.redirect('/errors/404');
            });
    } else {
        res.redirect('/dashboard');
    }
};

const cleanupSession = (session, retainCaseType = false) => {
    const retainedList = [
        'applicantEmail',
        'payloadVersion',
        'userLoggedIn'
    ];
    if (retainCaseType) {
        retainedList.push('caseType');
    }
    Object.keys(session.form).forEach((key) => {
        if (!retainedList.includes(key)) {
            delete session.form[key];
        }
    });
};

module.exports.initDashboard = initDashboard;
module.exports.getCase = getCase;
