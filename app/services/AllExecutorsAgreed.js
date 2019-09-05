'use strict';

const Service = require('./Service');

class AllExecutorsAgreed extends Service {
    get(formdataId) {
        const headers = {
            'Content-Type': 'application/json',
            'Session-Id': this.sessionId
        };
        this.log('Get all executors agreed');
        const url = this.formatUrl.format(this.endpoint, `/invite/allAgreed/${formdataId}`);
        const fetchOptions = this.fetchOptions({}, 'GET', headers);
        return this.fetchText(url, fetchOptions);
    }
}

module.exports = AllExecutorsAgreed;
