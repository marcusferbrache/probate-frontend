'use strict';

const initSteps = require('app/core/initSteps');
const {expect} = require('chai');
const steps = initSteps([`${__dirname}/../../../app/steps/action/`, `${__dirname}/../../../app/steps/ui`]);
const Recap = steps.Recap;

describe('Recap', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = Recap.constructor.getUrl();
            expect(url).to.equal('/recap');
            done();
        });
    });

    describe('getContextData()', () => {
        it('should return the correct ctx for a probate journey', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {
                    form: {
                        caseType: 'gop',
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'CaseCreated'
                        },
                        will: {
                            codicils: 'optionYes',
                            codicilsNumber: '3'
                        },
                        iht: {
                            method: 'optionPaper',
                            form: 'optionIHT205'
                        },
                        userLoggedIn: true
                    },
                    caseType: 'gop'
                }
            };
            const ctx = Recap.getContextData(req);
            expect(ctx).to.deep.equal({
                sessionID: 'dummy_sessionId',
                caseType: 'gop',
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                ccdReferenceNumber: '1234-5678-9012-3456',
                ccdReferenceNumberAccessible: '1 2 3 4, -, 5 6 7 8, -, 9 0 1 2, -, 3 4 5 6',
                registryAddress: 'Digital Application\nOxford District Probate Registry\nCombined Court Building\nSt Aldates\nOxford\nOX1 1LY',
                hasCodicils: true,
                codicilsNumber: '3',
                hasMultipleApplicants: false,
                hasRenunciated: false,
                executorsNameChangedByDeedPollList: [],
                is205: true,
                checkAnswersSummary: false,
                legalDeclaration: false,
                userLoggedIn: true
            });
            done();
        });

        it('should return the correct ctx for an intestacy journey', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {
                    form: {
                        caseType: 'intestacy',
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'CaseCreated'
                        },
                        deceased: {
                            maritalStatus: 'optionMarried'
                        },
                        applicant: {
                            relationshipToDeceased: 'optionChild'
                        },
                        iht: {
                            method: 'optionPaper',
                            form: 'optionIHT205'
                        },
                        userLoggedIn: true
                    },
                    caseType: 'intestacy'
                }
            };
            const ctx = Recap.getContextData(req);
            expect(ctx).to.deep.equal({
                sessionID: 'dummy_sessionId',
                caseType: 'intestacy',
                ccdCase: {
                    id: 1234567890123456,
                    state: 'CaseCreated'
                },
                ccdReferenceNumber: '1234-5678-9012-3456',
                ccdReferenceNumberAccessible: '1 2 3 4, -, 5 6 7 8, -, 9 0 1 2, -, 3 4 5 6',
                registryAddress: 'Digital Application\nOxford District Probate Registry\nCombined Court Building\nSt Aldates\nOxford\nOX1 1LY',
                is205: true,
                spouseRenouncing: true,
                checkAnswersSummary: false,
                legalDeclaration: false,
                userLoggedIn: true
            });
            done();
        });
    });

    describe('nextStepOptions()', () => {
        it('should return the correct options', (done) => {
            const nextStepOptions = Recap.nextStepOptions({});
            expect(nextStepOptions).to.deep.equal({
                options: [{
                    key: 'documentsNotSentOrReceived',
                    value: true,
                    choice: 'documentsNotSentOrReceived'
                }]
            });
            done();
        });
    });

    describe('action()', () => {
        it('test it cleans up context', () => {
            const ctx = {
                caseType: 'gop',
                ccdReferenceNumber: '1234-5678-9012-3456',
                ccdReferenceNumberAccessible: '1 2 3 4, -, 5 6 7 8, -, 9 0 1 2, -, 3 4 5 6',
                registryAddress: 'Some address',
                checkAnswersSummary: true,
                legalDeclaration: true,
                hasCodicils: true,
                codicilsNumber: 3,
                hasMultipleApplicants: false,
                hasRenunciated: false,
                executorsNameChangedByDeedPollList: false,
                spouseRenouncing: false,
                is205: true
            };
            const formdata = {};

            Recap.action(ctx, formdata);

            expect(ctx).to.deep.equal({});
        });
    });
});
