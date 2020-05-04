'use strict';

const {get} = require('lodash');
const FeesLookup = require('app/services/FeesLookup');
const config = require('config');
const logger = require('app/components/logger')('Init');

class FeesCalculator {

    constructor(endpoint, sessionId) {
        this.endpoint = endpoint;
        this.sessionId = sessionId;
        this.issuesData = {
            amount_or_volume: 0,
            applicant_type: 'personal',
            channel: 'default',
            event: 'issue',
            jurisdiction1: 'family',
            jurisdiction2: 'probate registry',
            service: 'probate'
        };
        this.copiesData = {
            amount_or_volume: 0,
            applicant_type: 'all',
            channel: 'default',
            event: 'copies',
            jurisdiction1: 'family',
            jurisdiction2: 'probate registry',
            service: 'probate',
            keyword: 'NewFee'
        };
        this.feesLookup = new FeesLookup(this.endpoint, sessionId);
    }

    calc(formdata, authToken, featureToggles) {
        const headers = {
            authToken: authToken
        };
        return createCallsRequired(formdata, headers, featureToggles, this.feesLookup, this.issuesData, this.copiesData);
    }
}

async function createCallsRequired(formdata, headers, featureToggles, feesLookup, issuesData, copiesData) {
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
        logger.info('Sending APPLICATION FEE request to API with the following payload:');
        logger.info(JSON.stringify(issuesData));

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
        logger.info('Sending COPIES FEE request to API with the following payload:');
        logger.info(JSON.stringify(copiesData));

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
 * if no fee_amount is returned, we assume an error has occurred
 * this caters for 404 type messages etc.
 */
const identifyAnyErrors = (res) => {
    if (res.fee_amount) {
        return false;
    }
    return true;
};

module.exports = FeesCalculator;
