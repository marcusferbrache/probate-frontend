'use strict';

const config = require('app/config');
const express = require('express');
const logger = require('app/components/logger');
const app = express();
const router = require('express').Router();
const ORCHESTRATOR_PORT = config.services.orchestrator.port;
const caseTypes = require('app/utils/CaseTypes');

router.get('/forms/cases', (req, res) => {
    res.status(200);
    res.send({
        applications: [
            {
                deceasedFullName: 'David Cameron',
                dateCreated: '13 July 2016',
                ccdCase: {
                    id: '1234-5678-9012-3456',
                    state: 'Draft'
                }
            },
            {
                deceasedFullName: 'Theresa May',
                dateCreated: '24 July 2019',
                ccdCase: {
                    id: '5678-9012-3456-1234',
                    state: 'CaseCreated'
                }
            },
            {
                deceasedFullName: 'Boris Johnson',
                dateCreated: '31 October 2019',
                ccdCase: {
                    id: '9012-3456-1234-5678',
                    state: 'Draft'
                }
            },
            {
                dateCreated: '31 October 2019',
                ccdCase: {
                    id: '3456-1234-5678-9012',
                    state: 'Draft'
                }
            }
        ]
    });
});

router.get('/forms/case/*', (req, res) => {
    const ccdCaseId = req.originalUrl.split('/')[3];
    let formdata;

    switch (ccdCaseId) {
    case '1234-5678-9012-3456':
        formdata = {
            caseType: caseTypes.GOP,
            ccdCase: {
                id: '1234-5678-9012-3456',
                state: 'Draft'
            },
            executors: {},
            deceased: {
                firstName: 'David',
                lastName: 'Cameron',
                'dob-day': 9,
                'dob-month': 10,
                'dob-year': 1966,
                'dob-date': '1966-10-09T00:00:00.000Z',
                'dob-formattedDate': '9 October 1966',
                'dod-day': 13,
                'dod-month': 7,
                'dod-year': 2016,
                'dod-date': '2016-07-13T00:00:00.000Z',
                'dod-formattedDate': '13 July 2016'
            }
        };
        break;
    case '5678-9012-3456-1234':
        formdata = {
            caseType: caseTypes.GOP,
            ccdCase: {
                id: '5678-9012-3456-1234',
                state: 'CaseCreated'
            },
            executors: {},
        };
        break;
    case '9012-3456-1234-5678':
        formdata = {
            caseType: caseTypes.GOP,
            ccdCase: {
                id: '9012-3456-1234-5678',
                state: 'Draft'
            },
            executors: {},
        };
        break;
    case '3456-1234-5678-9012':
        formdata = {
            caseType: caseTypes.INTESTACY,
            ccdCase: {
                id: '3456-1234-5678-9012',
                state: 'Draft'
            },
            executors: {},
        };
        break;
    default:
        formdata = {
            executors: {},
        };
        break;
    }

    res.status(200);
    res.send({
        formdata: formdata
    });
});

router.post('/forms/newcase', (req, res) => {
    res.status(200);
    res.send({
        formdata: {
            ccdCase: {
                id: '3456-1234-5678-9012',
                state: 'Draft'
            }
        }
    });
});

app.use(router);

logger().info(`Listening on: ${ORCHESTRATOR_PORT}`);

const server = app.listen(ORCHESTRATOR_PORT);

module.exports = server;