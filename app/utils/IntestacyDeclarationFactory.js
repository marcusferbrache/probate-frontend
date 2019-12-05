'use strict';

const {get} = require('lodash');
const applicant2NameFactory = require('app/utils/Applicant2NameFactory');

class IntestacyDeclarationFactory {

    static build(ctx, content, formdata) {
        const legalStatement = {};
        const declaration = {};

        legalStatement.en = {
            intro: content.en.intro,
            applicant: content.en.legalStatementApplicant
                .replace('{applicantName}', formdata.applicantName)
                .replace('{applicantAddress}', formdata.applicantAddress.formattedAddress),
            deceased: content.en.intestacyLegalStatementDeceased
                .replace('{deceasedName}', formdata.deceasedName)
                .replace('{deceasedAddress}', formdata.deceasedAddress.formattedAddress)
                .replace('{deceasedDob}', formdata.dobFormattedDate)
                .replace('{deceasedDod}', formdata.dodFormattedDate),
            deceasedOtherNames: formdata.deceasedOtherNames ? content.en.deceasedOtherNames.replace('{deceasedOtherNames}', formdata.deceasedOtherNames) : '',
            deceasedMaritalStatus: content.en.intestacyDeceasedMaritalStatus
                .replace('{deceasedMaritalStatus}', get(formdata.deceased, 'maritalStatus', '').toLowerCase()),
            deceasedChildren: content.en.intestacyDeceasedChildren,
            deceasedEstateValue: content.en.deceasedEstateValue
                .replace('{ihtGrossValue}', formdata.ihtGrossValue)
                .replace('{ihtNetValue}', formdata.ihtNetValue),
            deceasedEstateAssetsOverseas: content.en.intestacyDeceasedEstateOutside
                .replace('{ihtNetValueAssetsOutside}', formdata.ihtNetValueAssetsOutside),
            deceasedEstateLand: content.en.intestacyDeceasedEstateLand
                .replace(/{deceasedName}/g, formdata.deceasedName),
            applying: content.en.intestacyLettersOfAdministration
                .replace('{deceasedName}', formdata.deceasedName)
        };

        legalStatement.en.applicant2 = applicant2NameFactory.getApplicant2Name(formdata, content.en);

        declaration.en = {
            confirm: content.en.declarationConfirm
                .replace('{deceasedName}', formdata.deceasedName),
            confirmItem1: content.en.declarationConfirmItem1,
            confirmItem2: content.en.declarationConfirmItem2,
            confirmItem3: content.en['declarationConfirmItem3-intestacy'],
            requests: content.en.declarationRequests,
            requestsItem1: content.en['declarationRequestsItem1-intestacy'],
            requestsItem2: content.en['declarationRequestsItem2-intestacy'],
            understand: content.en.declarationUnderstand,
            understandItem1: content.en['declarationUnderstandItem1-intestacy'],
            understandItem2: content.en.declarationUnderstandItem2,
            accept: content.en.declarationCheckbox,
            submitWarning: content.en.submitWarning
        };

        if (ctx.bilingual === 'true') {
            legalStatement.cy = {
                intro: content.cy.intro,
                applicant: content.cy.legalStatementApplicant
                    .replace('{applicantName}', formdata.applicantName)
                    .replace('{applicantAddress}', formdata.applicantAddress.formattedAddress),
                deceased: content.cy.intestacyLegalStatementDeceased
                    .replace('{deceasedName}', formdata.deceasedName)
                    .replace('{deceasedAddress}', formdata.deceasedAddress.formattedAddress)
                    .replace('{deceasedDob}', formdata.dobFormattedDate)
                    .replace('{deceasedDod}', formdata.dodFormattedDate),
                deceasedOtherNames: formdata.deceasedOtherNames ? content.cy.deceasedOtherNames.replace('{deceasedOtherNames}', formdata.deceasedOtherNames) : '',
                deceasedMaritalStatus: content.cy.intestacyDeceasedMaritalStatus
                    .replace('{deceasedMaritalStatus}', get(formdata.deceased, 'maritalStatus', '').toLowerCase()),
                deceasedChildren: content.cy.intestacyDeceasedChildren,
                deceasedEstateValue: content.cy.deceasedEstateValue
                    .replace('{ihtGrossValue}', formdata.ihtGrossValue)
                    .replace('{ihtNetValue}', formdata.ihtNetValue),
                deceasedEstateAssetsOverseas: content.cy.intestacyDeceasedEstateOutside
                    .replace('{ihtNetValueAssetsOutside}', formdata.ihtNetValueAssetsOutside),
                deceasedEstateLand: content.cy.intestacyDeceasedEstateLand
                    .replace(/{deceasedName}/g, formdata.deceasedName),
                applying: content.cy.intestacyLettersOfAdministration
                    .replace('{deceasedName}', formdata.deceasedName)
            };

            legalStatement.cy.applicant2 = applicant2NameFactory.getApplicant2Name(formdata, content.cy);

            declaration.cy = {
                confirm: content.cy.declarationConfirm
                    .replace('{deceasedName}', formdata.deceasedName),
                confirmItem1: content.cy.declarationConfirmItem1,
                confirmItem2: content.cy.declarationConfirmItem2,
                confirmItem3: content.cy['declarationConfirmItem3-intestacy'],
                requests: content.cy.declarationRequests,
                requestsItem1: content.cy['declarationRequestsItem1-intestacy'],
                requestsItem2: content.cy['declarationRequestsItem2-intestacy'],
                understand: content.cy.declarationUnderstand,
                understandItem1: content.cy['declarationUnderstandItem1-intestacy'],
                understandItem2: content.cy.declarationUnderstandItem2,
                accept: content.cy.declarationCheckbox,
                submitWarning: content.cy.submitWarning
            };
        }

        return {legalStatement, declaration};
    }
}

module.exports = IntestacyDeclarationFactory;
