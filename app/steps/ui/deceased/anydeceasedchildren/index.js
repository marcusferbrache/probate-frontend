'use strict';

const ValidationStep = require('app/core/steps/ValidationStep');

class AnyDeceasedChildren extends ValidationStep {

    static getUrl() {
        return '/any-deceased-children';
    }
}

module.exports = AnyDeceasedChildren;
