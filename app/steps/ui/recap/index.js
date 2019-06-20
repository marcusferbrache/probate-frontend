'use strict';

const Step = require('app/core/steps/Step');
const RegistryWrapper = require('app/wrappers/Registry');
const FormatCcdCaseId = require('app/utils/FormatCcdCaseId');
const content = require('app/resources/en/translation/recap');

class Recap extends Step {

    static getUrl () {
        return '/recap';
    }

    handleGet(ctx, formdata) {
        const registryAddress = (new RegistryWrapper(formdata.registry)).address();

        ctx.ccdReferenceNumber = FormatCcdCaseId.format(formdata.ccdCase);
        ctx.ccdReferenceNumber = '1234-5678-9012-3456'; // For demo purposes only
        ctx.ccdReferenceNumberAccessible = ctx.ccdReferenceNumber.split('').join(' ');
        ctx.ccdReferenceNumberAccessible = ctx.ccdReferenceNumberAccessible.replace(/ - /g, ', -, ');
        ctx.registryAddress = registryAddress ? registryAddress : content.block1Address;

        ctx.checkAnswersSummary = false;
        ctx.legalDeclaration = false;
        if (formdata.checkAnswersSummary) {
            ctx.checkAnswersSummary = true;
        }
        if (formdata.legalDeclaration) {
            ctx.legalDeclaration = true;
        }

        ctx.documentsSent = false; // For demo purposes only
        ctx.checkAnswersSummary = true; // For demo purposes only
        ctx.legalDeclaration = true; // For demo purposes only

        return [ctx];
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.ccdReferenceNumber;
        delete ctx.ccdReferenceNumberAccessible;
        return [ctx, formdata];
    }
}

module.exports = Recap;
