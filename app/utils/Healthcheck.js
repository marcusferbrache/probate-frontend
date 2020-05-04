'use strict';

const FormatUrl = require('app/utils/FormatUrl');
const {asyncFetch, fetchOptions} = require('app/components/api-utils');
const config = require('config');
const statusUp = 'UP';
const statusDown = 'DOWN';

class Healthcheck {
    formatUrl(endpoint) {
        return url => FormatUrl.format(url, endpoint);
    }

    createServicesList(urlFormatter, servicesConfig) {
        return [
            {name: 'Business Service', url: urlFormatter(servicesConfig.validation.url)},
            {name: 'Orchestrator Service', url: urlFormatter(servicesConfig.orchestrator.url)}
        ];
    }

    createPromisesList(services, callback) {
        const fetchOpts = fetchOptions({}, 'GET', {});
        return services.map(service => asyncFetch(service.url, fetchOpts, res => res.json()
            .then(json => {
                return callback({service: service, json: json});
            }))
            .catch(err => {
                return callback({service: service, err: err});
            }));
    }

    health({err, service, json}) {
        if (err) {
            return {name: service.name, status: statusDown, error: err.toString()};
        }
        return {name: service.name, status: json.status};
    }

    info({err, json}) {
        if (err) {
            return {gitCommitId: err.toString()};
        }
        return {gitCommitId: json.git.commit.id};
    }

    getDownstream(type, callback) {
        const url = this.formatUrl(config.endpoints[type.name]);
        const services = this.createServicesList(url, config.services);
        const promises = this.createPromisesList(services, type);
        Promise.all(promises).then(downstream => callback(downstream));
    }

    status(healthDownstream) {
        return healthDownstream.every(service => service.status === statusUp) ? statusUp : statusDown;
    }

    mergeInfoAndHealthData(healthDownstream, infoDownstream) {
        return healthDownstream.map((service, key) => {
            return Object.assign(service, {gitCommitId: infoDownstream[key].gitCommitId});
        });
    }
}

module.exports = Healthcheck;
