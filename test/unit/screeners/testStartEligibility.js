const initSteps = require('app/core/initSteps');
const expect = require('chai').expect;
const steps = initSteps([`${__dirname}/../../../app/steps/action/`, `${__dirname}/../../../app/steps/ui`]);
const startEligibility = steps.StartEligibility;

describe('StartEligibility', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = startEligibility.constructor.getUrl();
            expect(url).to.equal('/start-eligibility');
            done();
        });
    });

    describe('handleGet()', () => {
        it('should return isFeesApiToggleEnabled set to true and formatted Application and Copies fees when the fees_api toggle is ON', (done) => {
            const ctxToTest = {};
            const formdata = {
                allApplicationFees: {
                    fees: [
                        {max: 50000, amount: 0},
                        {min: 50000.01, max: 300000, amount: 250},
                        {min: 300000.01, max: 500000, amount: 750},
                        {min: 500000.01, max: 1000000, amount: 2500},
                        {min: 1000000.01, max: 1600000, amount: 4000},
                        {min: 1600000.01, max: 2000000, amount: 5000},
                        {min: 2000000.01, amount: 6000}
                    ]
                },
                allCopiesFees: {
                    fees: {
                        firstCopy: {
                            amount: 10
                        },
                        extraCopies: {
                            amount: 0.5
                        }
                    }
                }
            };
            const featureToggles = {
                fees_api: true
            };
            const [ctx] = startEligibility.handleGet(ctxToTest, formdata, featureToggles);
            expect(ctx.isFeesApiToggleEnabled).to.equal(true);
            expect(ctx.allApplicationFees).to.deep.equal([
                {
                    amount: '',
                    max: '&pound;50,000',
                    min: ''
                },
                {
                    amount: '&pound;250',
                    max: '&pound;300,000',
                    min: '&pound;50,000.01'
                },
                {
                    amount: '&pound;750',
                    max: '&pound;500,000',
                    min: '&pound;300,000.01'
                },
                {
                    amount: '&pound;2,500',
                    max: '&pound;1 million',
                    min: '&pound;500,000.01'
                },
                {
                    amount: '&pound;4,000',
                    max: '&pound;1.6 million',
                    min: '&pound;1.00000001 million'
                },
                {
                    amount: '&pound;5,000',
                    max: '&pound;2 million',
                    min: '&pound;1.60000001 million'
                },
                {
                    amount: '&pound;6,000',
                    max: '',
                    min: '&pound;2.00000001 million'
                }
            ]);
            expect(ctx.allCopiesFees).to.deep.equal({
                firstCopy: {
                    amount: '&pound;10'
                },
                extraCopies: {
                    amount: '50 pence'
                }
            });
            done();
        });

        it('should return false when the fees_api toggle is OFF', (done) => {
            const ctxToTest = {};
            const formdata = {};
            const featureToggles = {};
            const [ctx] = startEligibility.handleGet(ctxToTest, formdata, featureToggles);
            expect(ctx.isFeesApiToggleEnabled).to.equal(false);
            done();
        });
    });
});
