'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const services = require('app/components/services');
const FeatureToggle = require('app/utils/FeatureToggle');
let featureToggleStub;
let featureToggle;

describe('FeatureToggle', () => {
    beforeEach(() => {
        featureToggleStub = sinon.stub(services, 'featureToggle');
        featureToggle = new FeatureToggle();
    });

    afterEach(() => {
        featureToggleStub.restore();
    });

    describe('checkToggle()', () => {
        it('should call the callback function when the api returns successfully', (done) => {
            featureToggleStub.returns(Promise.resolve('true'));
            const params = {
                req: {session: {}},
                res: {},
                next: () => true,
                featureToggleKey: 'main_applicant_alias',
                callback: sinon.spy()
            };
            featureToggle.checkToggle(params).then(() => {
                expect(params.callback.calledOnce).to.equal(true);
                done();
            });
        });

        it('should call next() with an error when the api returns an error', (done) => {
            featureToggleStub.returns(Promise.reject(new Error()));
            const params = {
                req: {session: {}},
                res: {},
                next: sinon.spy(),
                featureToggleKey: 'main_applicant_alias',
                callback: () => true
            };
            featureToggle.checkToggle(params).then(() => {
                expect(params.next.calledOnce).to.equal(true);
                expect(params.next.calledWith(new Error())).to.equal(true);
                featureToggleStub.restore();
                done();
            });
        });
    });

    describe('togglePage()', () => {
        it('should call next() when isEnabled is set to true', (done) => {
            const params = {
                isEnabled: true,
                res: {},
                next: sinon.spy()
            };
            featureToggle.togglePage(params);
            expect(params.next.calledOnce).to.equal(true);
            expect(params.next.calledWith()).to.equal(true);
            done();
        });

        it('should redirect to the specified page when isEnabled is set to false', (done) => {
            const params = {
                isEnabled: false,
                res: {redirect: sinon.spy()},
                next: {},
                redirectPage: '/applicant-phone'
            };
            featureToggle.togglePage(params);
            expect(params.res.redirect.calledOnce).to.equal(true);
            expect(params.res.redirect.calledWith('/applicant-phone')).to.equal(true);
            done();
        });
    });

    describe('toggleFeature()', () => {
        describe('should set the feature toggle', () => {
            it('when the session contains a featureToggles object and call next()', (done) => {
                const params = {
                    req: {session: {featureToggles: {}}},
                    featureToggleKey: 'main_applicant_alias',
                    isEnabled: true,
                    next: sinon.spy()
                };
                featureToggle.toggleFeature(params);
                expect(params.req.session.featureToggles).to.deep.equal({main_applicant_alias: true});
                expect(params.next.calledOnce).to.equal(true);
                expect(params.next.calledWith()).to.equal(true);
                done();
            });

            it('when the session does not contain a featureToggles object and call next()', (done) => {
                const params = {
                    req: {session: {}},
                    featureToggleKey: 'main_applicant_alias',
                    isEnabled: true,
                    next: sinon.spy()
                };
                featureToggle.toggleFeature(params);
                expect(params.req.session.featureToggles).to.deep.equal({main_applicant_alias: true});
                expect(params.next.calledOnce).to.equal(true);
                expect(params.next.calledWith()).to.equal(true);
                done();
            });
        });
    });

    describe('isEnabled()', () => {
        describe('should return true', () => {
            it('if the feature toggle exists and is true', (done) => {
                const featureToggles = {main_applicant_alias: true};
                const key = 'main_applicant_alias';
                const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
                expect(isEnabled).to.equal(true);
                done();
            });
        });

        describe('should return false', () => {
            it('if the feature toggle exists and is false', (done) => {
                const featureToggles = {main_applicant_alias: false};
                const key = 'main_applicant_alias';
                const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
                expect(isEnabled).to.equal(false);
                done();
            });

            it('if the feature toggle does not exist', (done) => {
                const featureToggles = {};
                const key = 'main_applicant_alias';
                const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
                expect(isEnabled).to.equal(false);
                done();
            });

            it('if there are no feature toggles', (done) => {
                const featureToggles = '';
                const key = 'main_applicant_alias';
                const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
                expect(isEnabled).to.equal(false);
                done();
            });

            it('if the key is not specified', (done) => {
                const featureToggles = {main_applicant_alias: false};
                const key = '';
                const isEnabled = FeatureToggle.isEnabled(featureToggles, key);
                expect(isEnabled).to.equal(false);
                done();
            });
        });
    });
});