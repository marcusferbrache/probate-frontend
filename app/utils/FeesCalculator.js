'use strict';

const {get} = require('lodash');
const FeesLookup = require('app/services/FeesLookup');
const config = require('app/config');
let feesLookup;
const issuesData = {
    amount_or_volume: 0,
    applicant_type: 'all',
    channel: 'default',
    event: 'issue',
    jurisdiction1: 'family',
    jurisdiction2: 'probate registry',
    service: 'probate'
};

const copiesData = {
    amount_or_volume: 0,
    applicant_type: 'all',
    channel: 'default',
    event: 'copies',
    jurisdiction1: 'family',
    jurisdiction2: 'probate registry',
    service: 'probate',
    keyword: 'DEF'
};

class FeesCalculator {

    constructor(endpoint, sessionId) {
        this.endpoint = endpoint;
        this.sessionId = sessionId;
        feesLookup = new FeesLookup(this.endpoint, sessionId);
    }

    calc(formdata, authToken) {
        const headers = {
            authToken: authToken
        };
        return createCallsRequired(formdata, headers);
    }

    getApplicationFees(feesCodes) {
        return createApplicationFeesCalls(feesCodes);
    }

    getCopiesFees(feesCodes) {
        return createCopiesFeesCalls(feesCodes);
    }
}

async function createCopiesFeesCalls() {
    const returnResult = {
        status: 'success',
        fees: {
            firstCopy: {
                amount: null
            },
            extraCopies: {
                amount: null
            }
        }
    };

    copiesData.amount_or_volume = 1;

    await feesLookup.get(copiesData, {})
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.firstCopy.amount += res.fee_amount;
            }
        });

    delete copiesData.keyword;
    await feesLookup.get(copiesData, {})
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.extraCopies.amount += res.fee_amount;
            }
        });

    return returnResult;
}

async function createApplicationFeesCalls(feesCodes) {
    const returnResult = {
        status: 'success',
        fees: []
    };

    await feesLookup.getByCode(feesCodes[0])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[1])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[2])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[3])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[4])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[5])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    await feesLookup.getByCode(feesCodes[6])
        .then((res) => {
            if (identifyAnyErrors(res)) {
                returnResult.status = 'failed';
            } else {
                returnResult.fees.push(
                    {
                        min: res.min_range,
                        max: res.max_range,
                        amount: res.current_version.flat_amount.amount
                    }
                );
            }
        });

    return returnResult;
}

async function createCallsRequired(formdata, headers) {
    const returnResult = {
        status: 'success',
        applicationfee: 0,
        applicationvalue: 0,
        ukcopies: 0,
        ukcopiesfee: 0,
        overseascopies: 0,
        overseascopiesfee: 0,
        total: 0
    };

    issuesData.amount_or_volume = get(formdata, 'iht.netValue', 0);
    returnResult.applicationvalue = issuesData.amount_or_volume;
    if (issuesData.amount_or_volume > config.services.feesRegister.ihtMinAmt) {
        await feesLookup.get(issuesData, headers)
            .then((res) => {
                if (identifyAnyErrors(res)) {
                    returnResult.status = 'failed';
                } else {
                    returnResult.applicationfee = res.fee_amount;
                    returnResult.total += res.fee_amount;
                }
            });
    }

    copiesData.amount_or_volume = get(formdata, 'copies.uk', 0);
    returnResult.ukcopies = copiesData.amount_or_volume;
    if (copiesData.amount_or_volume > 0) {
        await feesLookup.get(copiesData, headers)
            .then((res) => {
                if (identifyAnyErrors(res)) {
                    returnResult.status = 'failed';
                } else {
                    returnResult.ukcopiesfee = res.fee_amount;
                    returnResult.total += res.fee_amount;
                }
            });
    }

    copiesData.amount_or_volume = get(formdata, 'copies.overseas', 0);
    returnResult.overseascopies = copiesData.amount_or_volume;
    if (copiesData.amount_or_volume > 0) {
        await feesLookup.get(copiesData, headers)
            .then((res) => {
                if (identifyAnyErrors(res)) {
                    returnResult.status = 'failed';
                } else {
                    returnResult.overseascopiesfee = res.fee_amount;
                    returnResult.total += res.fee_amount;
                }
            });
    }

    return returnResult;
}

/*
 * if no fee_amount is returned, we assume an error has occured
 * this caters for 404 type messages etc.
 */
function identifyAnyErrors(res) {
    if (res.fee_amount || (res.current_version && res.current_version.flat_amount)) {
        return false;
    }
    return true;
}

module.exports = FeesCalculator;