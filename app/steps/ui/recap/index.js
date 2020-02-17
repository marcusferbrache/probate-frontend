'use strict';

const caseTypes = require('app/utils/CaseTypes');
const ValidationStep = require('app/core/steps/ValidationStep');
const ExecutorsWrapper = require('app/wrappers/Executors');
const WillWrapper = require('app/wrappers/Will');
const RegistryWrapper = require('app/wrappers/Registry');
const FormatCcdCaseId = require('app/utils/FormatCcdCaseId');
const content = require('app/resources/en/translation/recap');

class Recap extends ValidationStep {

    static getUrl () {
        return '/recap';
    }

    getContextData(req) {
        const ctx = super.getContextData(req);
        const formdata = req.session.form || {};
        const registryAddress = (new RegistryWrapper(formdata.registry)).address();

        ctx.ccdReferenceNumber = FormatCcdCaseId.format(formdata.ccdCase);
        ctx.ccdReferenceNumberAccessible = FormatCcdCaseId.formatAccessible(formdata.ccdCase);
        ctx.registryAddress = registryAddress ? registryAddress : content.block1Text8;

        ctx.checkAnswersSummary = false;
        ctx.legalDeclaration = false;
        if (formdata.checkAnswersSummary) {
            ctx.checkAnswersSummary = true;
        }
        if (formdata.legalDeclaration) {
            ctx.legalDeclaration = true;
        }

        ctx.checkAnswersSummary = false; // Set to true/false for demo purposes only - REMOVE ONCE THE FLAGS ARE ADDED IN CCD
        ctx.legalDeclaration = false; // Set to true/false demo purposes only - REMOVE ONCE THE FLAGS ARE ADDED IN CCD

        if (ctx.caseType === caseTypes.GOP) {
            const executorsWrapper = new ExecutorsWrapper(formdata.executors);
            const willWrapper = new WillWrapper(formdata.will);

            ctx.hasCodicils = willWrapper.hasCodicils();
            ctx.codicilsNumber = willWrapper.codicilsNumber();
            ctx.hasMultipleApplicants = executorsWrapper.hasMultipleApplicants();
            ctx.hasRenunciated = executorsWrapper.hasRenunciated();
            ctx.executorsNameChangedByDeedPollList = executorsWrapper.executorsNameChangedByDeedPoll();
        } else {
            ctx.spouseRenouncing = formdata.deceased && formdata.deceased.maritalStatus === 'optionMarried' && (formdata.applicant.relationshipToDeceased === 'optionChild' || formdata.applicant.relationshipToDeceased === 'optionAdoptedChild');
        }

        ctx.is205 = formdata.iht && formdata.iht.method === 'optionPaper' && formdata.iht.form === 'optionIHT205';

        return ctx;
    }

    nextStepOptions(ctx) {
        ctx.documentsNotSentOrReceived = ctx.sentDocuments !== 'true' && ctx.receivedDocuments !== 'true';

        return {
            options: [
                {key: 'documentsNotSentOrReceived', value: true, choice: 'documentsNotSentOrReceived'}
            ]
        };
    }

    action(ctx, formdata) {
        super.action(ctx, formdata);
        delete ctx.ccdReferenceNumber;
        delete ctx.ccdReferenceNumberAccessible;
        delete ctx.registryAddress;
        delete ctx.checkAnswersSummary;
        delete ctx.legalDeclaration;
        delete ctx.hasCodicils;
        delete ctx.codicilsNumber;
        delete ctx.hasMultipleApplicants;
        delete ctx.hasRenunciated;
        delete ctx.executorsNameChangedByDeedPollList;
        delete ctx.spouseRenouncing;
        delete ctx.is205;
        return [ctx, formdata];
    }
}

module.exports = Recap;
