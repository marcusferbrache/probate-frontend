// eslint-disable-line max-lines

'use strict';

const initSteps = require('app/core/initSteps');
const {expect} = require('chai');
const co = require('co');
const submitResponse = require('test/data/send-to-submit-service');
const journey = require('app/journeys/probate');
const rewire = require('rewire');
const PaymentBreakdown = rewire('app/steps/ui/payment/breakdown/index');
const config = require('app/config');
const nock = require('nock');
const sinon = require('sinon');
const FeesCalculator = require('app/utils/FeesCalculator');
const Payment = require('app/services/Payment');

describe('PaymentBreakdown', () => {
    const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
    const section = 'paymentBreakdown';
    const templatePath = 'payment/breakdown';
    const i18next = {};
    const schema = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        properties: {}
    };
    let feesCalculator;

    describe('getContextData', () => {
        it('should return the context with the deceased name', (done) => {
            const PaymentBreakdown = steps.PaymentBreakdown;
            const req = {
                sessionID: 'dummy_sessionId',
                authToken: 'dummy_token',
                userId: 'dummy_userId',
                session: {
                    form: {
                        journeyType: 'probate',
                        deceased: {
                            firstName: 'Dee',
                            lastName: 'Ceased'
                        }
                    },
                    featureToggles: {
                        fees_api: true
                    },
                    journeyType: 'probate'
                },
                query: {
                    status: 'dummy_status'
                }
            };

            const ctx = PaymentBreakdown.getContextData(req);
            expect(ctx).to.deep.equal({
                authToken: 'dummy_token',
                userId: 'dummy_userId',
                deceasedLastName: 'Ceased',
                paymentError: 'dummy_status',
                journeyType: 'probate',
                sessionID: 'dummy_sessionId'
            });
            done();
        });
    });

    describe('handlePost', () => {
        const postInitiatedCardPayment = [{
            id: '24',
            amount: 5000,
            status: 'Initiated',
            description: 'Probate Payment: 50',
            reference: 'RC-1234-5678-9012-3456',
            date_created: '2018-08-29T15:25:11.920+0000',
            _links: {}
        }];
        const successfulCasePaymentsResponse = {
            payments: [{
                amount: 216.50,
                ccd_case_number: '1535395401245028',
                payment_reference: 'RC-67890',
                status: 'Success'
            }]
        };
        const initiatedCasePaymentsResponse = {
            payments: [{
                amount: 216.50,
                ccd_case_number: '1535395401245028',
                payment_reference: 'RC-67890',
                status: 'Initiated'
            }]
        };
        const successPaymentResponse = {
            channel: 'Online',
            amount: 5000,
            ccd_case_number: '1535395401245028',
            payment_reference: 'RC-67890',
            status: 'Success',
            date_updated: '2018-08-29T15:25:11.920+0000',
            site_id: 'siteId0001',
            external_reference: 12345
        };
        const initiatedPaymentResponse = {
            channel: 'Online',
            amount: 5000,
            ccd_case_number: '1535395401245028',
            payment_reference: 'RC-67890',
            status: 'Initiated',
            date_updated: '2018-08-29T15:25:11.920+0000',
            site_id: 'siteId0001',
            external_reference: 12345
        };
        const featureToggles = {};
        let revertAuthorise;
        let expectedPaymentFormdataFtON;
        let expectedPaAppCreatedFormdataFtON;
        let expectedPaymentFormdataFtOFF;
        let expectedPaAppCreatedFormdataFtOFF;
        let hostname;
        let ctxTestData;
        let errorsTestData;
        let session;

        beforeEach(() => {
            featureToggles.fees_api = true;

            expectedPaAppCreatedFormdataFtON = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                payment: {
                    total: 2520.5
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            expectedPaymentFormdataFtON = {
                payment: {
                    total: 216.50
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                }
            };
            expectedPaAppCreatedFormdataFtOFF = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                payment: {
                    total: 216.50
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            expectedPaymentFormdataFtOFF = {
                payment: {
                    total: 216.50
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                }
            };

            hostname = 'localhost';
            ctxTestData = {
                total: 215
            };
            errorsTestData = [];
            session = {
                save: () => true
            };
            revertAuthorise = PaymentBreakdown.__set__({
                Authorise: class {
                    post() {
                        return Promise.resolve({name: 'Success'});
                    }
                }
            });

            nock(config.services.submit.url)
                .post('/submit')
                .reply(200, submitResponse);

            feesCalculator = sinon.stub(FeesCalculator.prototype, 'calc');
        });

        afterEach(() => {
            revertAuthorise();
            nock.cleanAll();
            feesCalculator.restore();
        });

        it('FT ON - Sets reference if ctx.total > 0 and payment exists with status of Initiated', (done) => {
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns({});
            const postStub = sinon
                .stub(Payment.prototype, 'post')
                .returns(postInitiatedCardPayment);
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtON.payment.reference = 'RC-1234-5678-9012-3456';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtON);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                postStub.restore();
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Sets reference if ctx.total > 0 and payment exists with status of Initiated', (done) => {
            featureToggles.fees_api = false;
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns({});
            const postStub = sinon
                .stub(Payment.prototype, 'post')
                .returns(postInitiatedCardPayment);
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtOFF.payment.reference = 'RC-1234-5678-9012-3456';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtOFF);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                postStub.restore();
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Sets nextStepUrl to payment-status if ctx.total = 0', (done) => {
            const req = {
                session: {
                    journey: journey
                }
            };
            let ctx = {total: 0};
            let errors = [];
            const formdata = {
                fees: {
                    total: 0.0
                }
            };

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 0,
                ukcopiesfee: 0.00,
                overseascopies: 0,
                overseascopiesfee: 0,
                total: 0.0
            }));

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata, session, hostname, featureToggles);
                expect(paymentBreakdown.nextStepUrl(req)).to.equal('/payment-status');
                expect(errors).to.deep.equal(errorsTestData);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Sets nextStepUrl to payment-status if ctx.total = 0', (done) => {
            featureToggles.fees_api = false;
            const req = {
                session: {
                    journey: journey
                }
            };
            let ctx = {total: 0};
            let errors = [];
            const formdata = {
                fees: {
                    total: 0.0
                }
            };

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 0,
                ukcopiesfee: 0.00,
                overseascopies: 0,
                overseascopiesfee: 0,
                total: 0.0
            }));

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata, session, hostname, featureToggles);
                expect(paymentBreakdown.nextStepUrl(req)).to.equal('/payment-status');
                expect(errors).to.deep.equal(errorsTestData);
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Sets nextStepUrl to payment-status if payment.status is Success', (done) => {
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(successfulCasePaymentsResponse);
            const req = {
                session: {
                    journey: journey
                }
            };
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'CaseCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            let ctx = {
                total: 2520.5
            };
            let errors = [];

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata, session, hostname, featureToggles);
                expect(paymentBreakdown.nextStepUrl(req)).to.equal('/payment-status');
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Sets nextStepUrl to payment-status if payment.status is Success', (done) => {
            featureToggles.fees_api = false;
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(successfulCasePaymentsResponse);
            const req = {
                session: {
                    journey: journey
                }
            };
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'CaseCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            let ctx = {
                total: 215
            };
            let errors = [];

            co(function* () {
                [ctx, errors] = yield paymentBreakdown.handlePost(ctx, errors, formdata, session, hostname, featureToggles);
                expect(paymentBreakdown.nextStepUrl(req)).to.equal('/payment-status');
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - If ctx.total > 0 and the formdata does not contain a payment.reference', (done) => {
            const postStub = sinon
                .stub(Payment.prototype, 'post')
                .returns(postInitiatedCardPayment);
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtON.payment.reference = 'RC-1234-5678-9012-3456';
            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtON);
                expect(errors).to.deep.equal(errorsTestData);
                expect(ctx).to.deep.equal({
                    isFeesApiToggleEnabled: true,
                    applicationFee: 2500,
                    copies: {
                        uk: {
                            cost: 10,
                            number: 1
                        },
                        overseas: {
                            cost: 10.5,
                            number: 2
                        }
                    },
                    total: 2520.5,
                    reference: 'RC-1234-5678-9012-3456',
                    paymentCreatedDate: '2018-08-29T15:25:11.920+0000',
                });
                postStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - If ctx.total > 0 and the formdata does not contain a payment.reference', (done) => {
            featureToggles.fees_api = false;
            const postStub = sinon
                .stub(Payment.prototype, 'post')
                .returns(postInitiatedCardPayment);
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtOFF.payment.reference = 'RC-1234-5678-9012-3456';
            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtOFF);
                expect(errors).to.deep.equal(errorsTestData);
                expect(ctx).to.deep.equal({
                    isFeesApiToggleEnabled: false,
                    applicationFee: 215,
                    copies: {
                        uk: {
                            cost: 0.5,
                            number: 1
                        },
                        overseas: {
                            cost: 1,
                            number: 2
                        }
                    },
                    total: 216.50,
                    reference: 'RC-1234-5678-9012-3456',
                    paymentCreatedDate: '2018-08-29T15:25:11.920+0000',
                });
                postStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Returns error message if ctx.total > 0 and authorise service returns error', (done) => {
            revertAuthorise = PaymentBreakdown.__set__({
                Authorise: class {
                    post() {
                        return Promise.resolve({name: 'Error'});
                    }
                }
            });
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(errors).to.deep.equal([{
                    param: 'authorisation',
                    msg: {
                        summary: 'We could not take your payment, please try again later.',
                        message: 'payment.breakdown.errors.authorisation.failure.message'
                    }
                }]);
                expect(ctx).to.deep.equal(ctxTestData);
                revertAuthorise();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Returns error message if ctx.total > 0 and authorise service returns error', (done) => {
            featureToggles.fees_api = false;
            revertAuthorise = PaymentBreakdown.__set__({
                Authorise: class {
                    post() {
                        return Promise.resolve({name: 'Error'});
                    }
                }
            });
            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                }
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(errors).to.deep.equal([{
                    param: 'authorisation',
                    msg: {
                        summary: 'We could not take your payment, please try again later.',
                        message: 'payment.breakdown.errors.authorisation.failure.message'
                    }
                }]);
                expect(ctx).to.deep.equal(ctxTestData);
                revertAuthorise();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - If sendToSubmitService returns DUPLICATE_SUBMISSION', (done) => {
            const stub = sinon
                .stub(PaymentBreakdown.prototype, 'sendToSubmitService')
                .returns([
                    'DUPLICATE_SUBMISSION',
                    [{
                        param: 'submit',
                        msg: {
                            summary: 'Your application has been submitted, please return to the tasklist to continue',
                            message: 'payment.breakdown.errors.submit.duplicate.message'
                        }
                    }]
                ]);

            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                }

            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal({
                    isFeesApiToggleEnabled: true,
                    total: 2520.5,
                    applicationFee: 2500,
                    copies: {
                        uk: {
                            cost: 10,
                            number: 1
                        },
                        overseas: {
                            cost: 10.5,
                            number: 2
                        }
                    }});
                expect(errors).to.deep.equal([{
                    param: 'submit',
                    msg: {
                        summary: 'Your application has been submitted, please return to the tasklist to continue',
                        message: 'payment.breakdown.errors.submit.duplicate.message'
                    }
                }]);
                stub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - If sendToSubmitService returns DUPLICATE_SUBMISSION', (done) => {
            featureToggles.fees_api = false;
            const stub = sinon
                .stub(PaymentBreakdown.prototype, 'sendToSubmitService')
                .returns([
                    'DUPLICATE_SUBMISSION',
                    [{
                        param: 'submit',
                        msg: {
                            summary: 'Your application has been submitted, please return to the tasklist to continue',
                            message: 'payment.breakdown.errors.submit.duplicate.message'
                        }
                    }]
                ]);

            const formdata = {
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                }

            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal({
                    isFeesApiToggleEnabled: false,
                    total: 216.50,
                    applicationFee: 215,
                    copies: {
                        uk: {
                            cost: 0.5,
                            number: 1
                        },
                        overseas: {
                            cost: 1,
                            number: 2
                        }
                    }});
                expect(errors).to.deep.equal([{
                    param: 'submit',
                    msg: {
                        summary: 'Your application has been submitted, please return to the tasklist to continue',
                        message: 'payment.breakdown.errors.submit.duplicate.message'
                    }
                }]);
                stub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Sets reference if ctx.total > 0 and payment exists with status of Success', (done) => {
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(successfulCasePaymentsResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                payment: {
                    reference: 'RC-1234-5678-9012-3456',
                    total: 2520.5
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtON.payment.reference = 'RC-67890';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtON);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Sets reference if ctx.total > 0 and payment exists with status of Success', (done) => {
            featureToggles.fees_api = false;
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(successfulCasePaymentsResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                payment: {
                    reference: 'RC-1234-5678-9012-3456',
                    total: 216.5
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtOFF.payment.reference = 'RC-67890';

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtOFF);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Set ctx.reference to a previous successful reference for a case.', (done) => {
            const caseSuccessPaymentResponse = {
                payments: [{
                    amount: 216.50,
                    ccd_case_number: '1535395401245028',
                    payment_reference: 'RC-12345',
                    status: 'Failed'
                }, {
                    amount: 216.50,
                    ccd_case_number: '1535395401245028',
                    payment_reference: 'RC-67890',
                    status: 'Success'
                }]
            };
            const identifySuccessfulOrInitiatedPaymentResponse = {
                amount: 2520.5,
                ccd_case_number: '1535395401245028',
                payment_reference: 'RC-67890',
                status: 'Success'
            };
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    getCasePayments() {
                        return caseSuccessPaymentResponse;
                    }
                    identifySuccessfulOrInitiatedPayment() {
                        return identifySuccessfulOrInitiatedPaymentResponse;
                    }
                }
            });
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                payment: {
                    reference: 'RC-12345',
                    total: 2520.5
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtON.payment.reference = 'RC-67890';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtON);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal(errorsTestData);
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Set ctx.reference to a previous successful reference for a case.', (done) => {
            featureToggles.fees_api = false;
            const caseSuccessPaymentResponse = {
                payments: [{
                    amount: 216.50,
                    ccd_case_number: '1535395401245028',
                    payment_reference: 'RC-12345',
                    status: 'Failed'
                }, {
                    amount: 216.50,
                    ccd_case_number: '1535395401245028',
                    payment_reference: 'RC-67890',
                    status: 'Success'
                }]
            };
            const identifySuccessfulOrInitiatedPaymentResponse = {
                amount: 216.50,
                ccd_case_number: '1535395401245028',
                payment_reference: 'RC-67890',
                status: 'Success'
            };
            const revert = PaymentBreakdown.__set__({
                Payment: class {
                    getCasePayments() {
                        return caseSuccessPaymentResponse;
                    }
                    identifySuccessfulOrInitiatedPayment() {
                        return identifySuccessfulOrInitiatedPaymentResponse;
                    }
                }
            });
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PaAppCreated'
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                payment: {
                    reference: 'RC-12345',
                    total: 216.50
                },
                registry: {
                    registry: {
                        address: 'Line 1 Ox\nLine 2 Ox\nLine 3 Ox\nPostCode Ox\n',
                        email: 'oxford@email.com',
                        name: 'Oxford',
                        sequenceNumber: 10034
                    },
                    submissionReference: 97
                },
                submissionReference: 97
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaAppCreatedFormdataFtOFF.payment.reference = 'RC-67890';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(formdata).to.deep.equal(expectedPaAppCreatedFormdataFtOFF);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal(errorsTestData);
                revert();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Show initiated error when a ctx.reference has been proven to be still in an initiated state.', (done) => {
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(initiatedCasePaymentsResponse);
            const getStub = sinon
                .stub(Payment.prototype, 'get')
                .returns(initiatedPaymentResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PAPaymentFailed'
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaymentFormdataFtON.payment.reference = 'RC-12345';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal([{
                    param: 'payment',
                    msg: {
                        summary: 'Your payment may have failed. Do not try to pay again for 2 hours.',
                        message: 'payment.breakdown.errors.payment.initiated.message'
                    }
                }]);
                getCasePaymentsStub.restore();
                getStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Show initiated error when a ctx.reference has been proven to be still in an initiated state.', (done) => {
            featureToggles.fees_api = false;
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(initiatedCasePaymentsResponse);
            const getStub = sinon
                .stub(Payment.prototype, 'get')
                .returns(initiatedPaymentResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PAPaymentFailed'
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaymentFormdataFtOFF.payment.reference = 'RC-12345';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal([{
                    param: 'payment',
                    msg: {
                        summary: 'Your payment may have failed. Do not try to pay again for 2 hours.',
                        message: 'payment.breakdown.errors.payment.initiated.message'
                    }
                }]);
                getCasePaymentsStub.restore();
                getStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it('FT ON - Show success when a ctx.reference was initiated state but has now expired.', (done) => {
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(initiatedCasePaymentsResponse);
            const getStub = sinon
                .stub(Payment.prototype, 'get')
                .returns(successPaymentResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PAPaymentFailed'
                },
                fees: {
                    status: 'success',
                    applicationfee: 2500,
                    applicationvalue: 600000,
                    ukcopies: 1,
                    ukcopiesfee: 10,
                    overseascopies: 2,
                    overseascopiesfee: 10.5,
                    total: 2520.5
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaymentFormdataFtON.payment.reference = 'RC-12345';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 2500,
                applicationvalue: 600000,
                ukcopies: 1,
                ukcopiesfee: 10,
                overseascopies: 2,
                overseascopiesfee: 10.5,
                total: 2520.5
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                getStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('FT OFF - Show success when a ctx.reference was initiated state but has now expired.', (done) => {
            featureToggles.fees_api = false;
            const getCasePaymentsStub = sinon
                .stub(Payment.prototype, 'getCasePayments')
                .returns(initiatedCasePaymentsResponse);
            const getStub = sinon
                .stub(Payment.prototype, 'get')
                .returns(successPaymentResponse);
            const formdata = {
                ccdCase: {
                    id: 1535395401245028,
                    state: 'PAPaymentFailed'
                },
                fees: {
                    status: 'success',
                    applicationfee: 215,
                    applicationvalue: 6000,
                    ukcopies: 1,
                    ukcopiesfee: 0.50,
                    overseascopies: 2,
                    overseascopiesfee: 1,
                    total: 216.50
                },
                payment: {
                    reference: 'RC-12345'
                }
            };
            const paymentBreakdown = new PaymentBreakdown(steps, section, templatePath, i18next, schema);
            expectedPaymentFormdataFtOFF.payment.reference = 'RC-12345';
            feesCalculator.returns(Promise.resolve({
                status: 'success',
                applicationfee: 215,
                applicationvalue: 6000,
                ukcopies: 1,
                ukcopiesfee: 0.50,
                overseascopies: 2,
                overseascopiesfee: 1,
                total: 216.50
            }));

            co(function* () {
                const [ctx, errors] = yield paymentBreakdown.handlePost(ctxTestData, errorsTestData, formdata, session, hostname, featureToggles);
                expect(ctx).to.deep.equal(ctxTestData);
                expect(ctx.reference).to.equal('RC-67890');
                expect(errors).to.deep.equal(errorsTestData);
                getCasePaymentsStub.restore();
                getStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
