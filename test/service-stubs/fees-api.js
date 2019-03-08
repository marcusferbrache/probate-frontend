'use strict';

/* eslint no-console: 0 */

const config = require('app/config');
const express = require('express');
const app = express();
const router = require('express').Router();
const FEES_API_PORT = config.services.feesRegister.port;

router.get(`/fees-register${config.services.feesRegister.paths.feesLookup}`, (req, res) => {
    res.status(200);
    if (req.query.event === 'issue') {
        res.send({
            'code': 'FEE0219',
            'description': 'Application for a grant of probate (Estate over £5000)',
            'version': 3,
            'fee_amount': 215
        });
    } else if (req.query.event === 'copies' && req.query.keyword === 'DEF') {
        res.send({
            'code': 'FEE0003',
            'description': 'Copy of a document (10 pages or less).',
            'version': 3,
            'fee_amount': 10
        });
    } else if (req.query.event === 'copies' && req.query.keyword !== 'DEF') {
        res.send({
            'code': 'FEE0003',
            'description': 'Additional copies of the grant representation',
            'version': 3,
            'fee_amount': 0.50
        });
    } else {
        res.send('false');
    }
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[0])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 0,
        max_range: 50000,
        current_version: {
            flat_amount: {
                amount: 0
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[1])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 50000.01,
        max_range: 300000,
        current_version: {
            flat_amount: {
                amount: 250
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[2])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 300000.01,
        max_range: 500000,
        current_version: {
            flat_amount: {
                amount: 750
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[3])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 500000.01,
        max_range: 1000000,
        current_version: {
            flat_amount: {
                amount: 2500
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[4])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 1000000.01,
        max_range: 1600000,
        current_version: {
            flat_amount: {
                amount: 4000
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[5])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 1600000.01,
        max_range: 2000000,
        current_version: {
            flat_amount: {
                amount: 5000
            }
        }
    });
});

router.get(`/fees-register${config.services.feesRegister.paths.feesByCode.replace('{feeCode}', config.services.feesRegister.applicationFeeCodes[6])}`, (req, res) => {
    res.status(200);
    res.send({
        min_range: 2000000.01,
        current_version: {
            flat_amount: {
                amount: 6000
            }
        }
    });
});

router.get('/health', (req, res) => {
    res.send({'status': 'UP'});
});

router.get('/info', (req, res) => {
    res.send({
        'git': {
            'commit': {
                'time': '2018-06-05T16:31+0000',
                'id': 'e210e75b38c6b8da03551b9f83fd909fe80832e1'
            }
        }
    });
});

app.use(router);

console.log(`Listening on: ${FEES_API_PORT}`);

const server = app.listen(FEES_API_PORT);

module.exports = server;
