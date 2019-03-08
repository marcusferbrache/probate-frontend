'use strict';
const config = require('app/config');
const FeesRegister = require('app/services/FeesRegister');
const {URLSearchParams} = require('url');

class FeesLookup extends FeesRegister {
    get(data, headers) {
        this.log('Get payment fees lookup');
        const params = new URLSearchParams(data);
        const url = `${this.endpoint}${config.services.feesRegister.paths.feesLookup}?${params.toString()}`;
        return super.get(url, headers);
    }

    getByCode(feeCode) {
        this.log('Get payment fee by code');
        const url = `${this.endpoint}${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', feeCode)}`;
        return super.get(url, {});
    }
}

module.exports = FeesLookup;
