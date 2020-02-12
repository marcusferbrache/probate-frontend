'use strict';

const UIStepRunner = require('app/core/runners/UIStepRunner');
const co = require('co');

class RedirectRunner extends UIStepRunner {

    handleGet(step, req, res) {
        const originalHandleGet = super.handleGet;

        return co(function* () {
            const ctx = step.getContextData(req);

            if (!req.session.form.applicantEmail) {
                req.log.error('req.session.form.applicantEmail does not exist');
            }

            req.session.form.applicantEmail = req.session.regId;
            const options = yield step.runnerOptions(ctx, req.session.form, req.session.language, req.sessionID);
            if (options.redirect && options.method !== 'POST') {
                res.redirect(options.url);
            } else if (options.method === 'POST') {
                options.service.post(options.body)
                    .then((rs) => {
                        req.log.info('Response from service:', rs);
                        req.log.info('Redirecting to: ', rs.startPageUrl);
                        res.redirect(rs.startPageUrl);
                    });
            } else {
                req.errors = options.errors;
                return originalHandleGet(step, req, res);
            }
        }).catch((error) => {
            const commonContent = require(`app/resources/${req.session.language}/translation/common`);

            req.log.error(error);
            res.status(500).render('errors/500', {common: commonContent, userLoggedIn: req.userLoggedIn});
        });
    }
}

module.exports = RedirectRunner;
