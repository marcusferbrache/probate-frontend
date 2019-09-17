'use strict';

const {expect} = require('chai');
const FormData = require('app/services/FormData');
const co = require('co');
const caseTypes = require('app/utils/CaseTypes');
const config = require('app/config');
const nock = require('nock');

describe('FormDataService', () => {
    describe('should call', () => {
        afterEach(() => {
            nock.cleanAll();
        });

        it('get() successfully', (done) => {
            const endpoint = 'http://localhost';
            const ccdCaseId = '1234-5678-9012-3456';
            const expectedForm = {caseType: caseTypes.GOP, ccdCase: {state: 'Draft', id: '1234-5678-9012-3456'}, deceased: {name: 'test'}};
            const authToken = 'authToken';
            const serviceAuthorisation = 'serviceAuthorisation';
            const formData = new FormData(endpoint, 'abc123');
            const path = formData.replacePlaceholderInPath(config.services.orchestrator.paths.forms, 'ccdCaseId', ccdCaseId);
            nock(endpoint, {
                reqheaders: {
                    'Content-Type': 'application/json',
                    Authorization: authToken,
                    ServiceAuthorization: serviceAuthorisation
                }
            }).get(path)
                .reply(200, expectedForm);

            co(function* () {
                const actualForm = yield formData.get(authToken, serviceAuthorisation, ccdCaseId);
                expect(actualForm).to.deep.equal(expectedForm);
                done();
            }).catch(err => {
                done(err);
            });
        });

        it('should call post() successfully', (done) => {
            const endpoint = 'http://localhost';
            const ccdCaseId = '1234-5678-9012-3456';
            const inputForm = {caseType: caseTypes.GOP, deceased: {name: 'test'}};
            const expectedForm = {caseType: caseTypes.GOP, deceased: {name: 'test'}};
            const authToken = 'authToken';
            const serviceAuthorisation = 'serviceAuthorisation';
            const formData = new FormData(endpoint, 'abc123');
            const path = formData.replacePlaceholderInPath(config.services.orchestrator.paths.forms, 'ccdCaseId', ccdCaseId);
            nock(endpoint, {
                reqheaders: {
                    'Content-Type': 'application/json',
                    Authorization: authToken,
                    ServiceAuthorization: serviceAuthorisation
                }
            }).post(path, expectedForm)
                .reply(200, expectedForm);

            co(function* () {
                const actualForm = yield formData.post(authToken, serviceAuthorisation, ccdCaseId, inputForm);
                expect(actualForm).to.deep.equal(expectedForm);
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
});