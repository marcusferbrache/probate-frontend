'use strict';

const initSteps = require('app/core/initSteps');
const {expect, assert} = require('chai');
const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
const CodicilsNumber = steps.CodicilsNumber;

describe('CodicilsNumber', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = CodicilsNumber.constructor.getUrl();
            expect(url).to.equal('/codicils-number');
            done();
        });
    });

    describe('getContextData()', () => {
        it('should return the ctx with the deceased address and the screening_question feature toggle on', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {form: {}, featureToggles: {screening_questions: true}},
                body: {
                    codicilsNumber: '3'
                }
            };
            const ctx = CodicilsNumber.getContextData(req);
            expect(ctx).to.deep.equal({
                codicilsNumber: 3,
                isToggleEnabled: true,
                sessionID: 'dummy_sessionId'
            });
            done();
        });

        it('should return the ctx with the deceased address and the screening_question feature toggle off', (done) => {
            const req = {
                sessionID: 'dummy_sessionId',
                session: {form: {}, featureToggles: {screening_questions: false}},
                body: {
                    codicilsNumber: '3'
                }
            };
            const ctx = CodicilsNumber.getContextData(req);
            expect(ctx).to.deep.equal({
                codicilsNumber: 3,
                isToggleEnabled: false,
                sessionID: 'dummy_sessionId'
            });
            done();
        });
    });

    describe('nextStepOptions()', () => {
        it('should return the correct options', (done) => {
            const nextStepOptions = CodicilsNumber.nextStepOptions();
            expect(nextStepOptions).to.deep.equal({
                options: [{
                    key: 'isToggleEnabled',
                    value: true,
                    choice: 'toggleOn'
                }]
            });
            done();
        });
    });

    describe('action', () => {
        it('test isToggleEnabled is removed from the context', () => {
            const ctx = {
                isToggleEnabled: false
            };
            CodicilsNumber.action(ctx);
            assert.isUndefined(ctx.isToggleEnabled);
        });
    });
});
