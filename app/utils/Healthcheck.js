'use strict';

const FormatUrl = require('app/utils/FormatUrl');
const {asyncFetch, fetchOptions, fetchJson} = require('app/components/api-utils');
const {get} = require('lodash');
const config = require('config');
const statusUp = 'UP';
const statusDown = 'DOWN';

class Healthcheck {
    formatUrl(endpoint) {
        return url => FormatUrl.format(url, endpoint);
    }

    createServicesList(urlFormatter, services) {
        return services.map(service => {
            return {
                name: service.name,
                url: urlFormatter(service.url),
                gitCommitIdPath: service.gitCommitIdPath
            };
        });
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

    info({err, service, json}) {
        if (err) {
            return {gitCommitId: err.toString()};
        }
        return {gitCommitId: get(json, service.gitCommitIdPath)};
    }

    getDownstream(services, type, callback) {
        const urlFormatter = this.formatUrl(config.endpoints.health);
        services = this.createServicesList(urlFormatter, services);
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

    getServiceHealth(service) {
        const urlFormatter = this.formatUrl(config.endpoints.health);
        const url = urlFormatter(service.url);
        const fetchOpts = fetchOptions({}, 'GET', {});
        return fetchJson(url, fetchOpts);
    }
}

module.exports = Healthcheck;
