'use strict';

const initSteps = require('app/core/initSteps');
const {assert, expect} = require('chai');
const co = require('co');
const rewire = require('rewire');
const Summary = rewire('app/steps/ui/summary');
const probateNewJourney = require('app/journeys/probatenewdeathcertflow');

describe('Summary-New', () => {
    const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
    let section;
    let templatePath;
    let i18next;
    let schema;

    beforeEach(() => {
        section = 'summary';
        templatePath = 'summary';
        i18next = {};
        schema = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            properties: {}
        };
    });

    describe('handleGet()', () => {
        it('ctx.executorsWithOtherNames returns array of execs with other names', (done) => {
            const expectedResponse = ['Prince', 'Cher'];

            let ctx = {
                session: {
                    form: {},
                    journey: probateNewJourney
                }
            };
            const formdata = {executors: {list: [{fullName: 'Prince', hasOtherName: true}, {fullName: 'Cher', hasOtherName: true}]}};
            const summary = new Summary(steps, section, templatePath, i18next, schema);

            co(function* () {
                [ctx] = yield summary.handleGet(ctx, formdata);
                assert.deepEqual(ctx.executorsWithOtherNames, expectedResponse);
                done();
            });
        });

        it('executorsWithOtherNames returns empty when hasOtherName is false', (done) => {
            const expectedResponse = [];
            let ctx = {
                session: {
                    form: {},
                    journey: probateNewJourney
                }
            };
            const formdata = {executors: {list: [{fullName: 'Prince', hasOtherName: false}, {fullName: 'Cher', hasOtherName: false}]}};
            const summary = new Summary(steps, section, templatePath, i18next, schema);

            co(function* () {
                [ctx] = yield summary.handleGet(ctx, formdata);
                assert.deepEqual(ctx.executorsWithOtherNames, expectedResponse);
                done();
            });
        });

        it('executorsWithOtherNames returns empty when list is empty', (done) => {
            const expectedResponse = [];
            let ctx = {
                session: {
                    form: {},
                    journey: probateNewJourney
                }
            };
            const formdata = {executors: {list: []}};
            const summary = new Summary(steps, section, templatePath, i18next, schema);

            co(function* () {
                [ctx] = yield summary.handleGet(ctx, formdata);
                assert.deepEqual(ctx.executorsWithOtherNames, expectedResponse);
                done();
            });
        });
    });

    describe('getContextData()', () => {
        it('[PROBATE] return the correct properties in ctx', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {
                    language: 'en',
                    form: {
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'Pending'
                        },
                        caseType: 'gop',
                        deceased: {
                            firstName: 'Dee',
                            lastName: 'Ceased'
                        },
                        iht: {
                            netValue: 300000
                        }
                    }
                },
                authToken: '1234'
            };
            const Summary = steps.Summary;
            const ctx = Summary.getContextData(req);
            expect(ctx).to.deep.equal({
                ccdCase: {
                    id: 1234567890123456,
                    state: 'Pending'
                },
                authToken: '1234',
                alreadyDeclared: false,
                deceasedAliasQuestion: 'Did Dee Ceased have assets in another name?',
                deceasedMarriedQuestion: 'Did Dee Ceased get married or enter into a civil partnership after the will was signed?',
                diedEnglandOrWalesQuestion: 'Did Dee Ceased die in England or Wales?',
                ihtTotalNetValue: 300000,
                caseType: 'gop',
                userLoggedIn: false,
                readyToDeclare: false,
                featureToggles: {ft_new_deathcert_flow: 'false'},
                session: {
                    language: 'en',
                    form: {
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'Pending'
                        },
                        caseType: 'gop',
                        deceased: {
                            firstName: 'Dee',
                            lastName: 'Ceased'
                        },
                        iht: {
                            netValue: 300000
                        },
                        summary: {
                            readyToDeclare: false
                        }
                    }
                },
                sessionID: 'dummy_sessionId',
                softStop: false,
                language: 'en'
            });
            done();
        });

        it('[INTESTACY] return the correct properties in ctx', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {
                    language: 'en',
                    form: {
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'Pending'
                        },
                        caseType: 'intestacy',
                        deceased: {
                            'firstName': 'Dee',
                            'lastName': 'Ceased',
                            'dod-date': '2015-02-02',
                            'dod-formattedDate': '2 February 2015'
                        },
                        iht: {
                            netValue: 300000,
                            netValueAssetsOutside: 250000,
                            assetsOutside: 'optionYes'
                        }
                    }
                },
                authToken: '12345'
            };
            const Summary = steps.Summary;
            const ctx = Summary.getContextData(req);
            expect(ctx).to.deep.equal({
                ccdCase: {
                    id: 1234567890123456,
                    state: 'Pending'
                },
                authToken: '12345',
                alreadyDeclared: false,
                deceasedAliasQuestion: 'Did Dee Ceased have assets in another name?',
                deceasedAllChildrenOver18Question: 'Are all of Dee Ceased&rsquo;s children over 18?',
                deceasedAnyChildrenQuestion: 'Did Dee Ceased have any children?',
                deceasedAnyDeceasedChildrenQuestion: 'Did any of Dee Ceased&rsquo;s children die before 2 February 2015?',
                deceasedAnyOtherChildrenQuestion: 'Did Dee Ceased have any other children?',
                deceasedDivorcePlaceQuestion: 'Did the separation take place in England or Wales?',
                deceasedMaritalStatusQuestion: 'What was Dee Ceased&rsquo;s marital status?',
                diedEnglandOrWalesQuestion: 'Did Dee Ceased die in England or Wales?',
                deceasedSpouseNotApplyingReasonQuestion: 'Why isn&rsquo;t Dee Ceased&rsquo;s spouse applying?',
                ihtThreshold: 250000,
                ihtTotalNetValue: 550000,
                ihtTotalNetValueGreaterThanIhtThreshold: true,
                caseType: 'intestacy',
                userLoggedIn: false,
                readyToDeclare: false,
                featureToggles: {ft_new_deathcert_flow: 'false'},
                session: {
                    language: 'en',
                    form: {
                        ccdCase: {
                            id: 1234567890123456,
                            state: 'Pending'
                        },
                        caseType: 'intestacy',
                        deceased: {
                            'dod-date': '2015-02-02',
                            'dod-formattedDate': '2 February 2015',
                            'firstName': 'Dee',
                            'lastName': 'Ceased'
                        },
                        iht: {
                            assetsOutside: 'optionYes',
                            netValue: 300000,
                            netValueAssetsOutside: 250000
                        },
                        summary: {
                            readyToDeclare: false
                        }
                    }
                },
                sessionID: 'dummy_sessionId',
                softStop: false,
                language: 'en'
            });
            done();
        });
    });
});
