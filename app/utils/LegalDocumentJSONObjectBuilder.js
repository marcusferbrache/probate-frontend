'use strict';

const cheerio = require('cheerio');
const FormatName = require('app/utils/FormatName');

class LegalDocumentJSONObjectBuilder {

    build(formdata, html) {
        const $ = cheerio.load(html);
        const legalDeclaration = {};
        legalDeclaration.headers = [];
        legalDeclaration.sections = [];
        const pageSections = $('.declaration-header-item, .declaration-subheader, .declaration-item, .govuk-list--bullet');

        for (const sectElement of Object.entries(pageSections)) {
            const $element = $(sectElement);
            if ($element.hasClass('declaration-header-item')) {
                legalDeclaration.headers.push($element.text());
            } else if ($element.hasClass('declaration-subheader')) {
                const section = buildSection($element);
                legalDeclaration.sections.push(section);
            } else if ($element.hasClass('declaration-item')) {
                buildDeclarationItem($element, legalDeclaration);
            } else if ($element.hasClass('govuk-list--bullet')) {
                buildDeclarationItemValues($element, legalDeclaration);
            }
        }
        legalDeclaration.dateCreated = new Date().toLocaleString();
        legalDeclaration.deceased = FormatName.format(formdata.deceased);

        return legalDeclaration;
    }
}

const buildDeclarationItemValues = ($element, legalDeclaration) => {
    const section = legalDeclaration.sections[legalDeclaration.sections.length - 1];
    const declarationItem = section.declarationItems.pop();
    declarationItem.values = [];
    const children = $element.children();
    if (children.length > 0) {
        const rows = children.parent().text()
            .split('\n');
        for (let i = 0; i < rows.length; ++i) {
            if (rows[i].trim().length > 0) {
                declarationItem.values.push(rows[i].trim());
            }
        }
    }
    section.declarationItems.push(declarationItem);
};

const buildDeclarationItem = ($element, legalDeclaration) => {
    const declarationItem = {};
    declarationItem.title = $element.text();
    const section = legalDeclaration.sections[legalDeclaration.sections.length - 1];
    section.declarationItems.push(declarationItem);
};

const buildSection = ($element) => {
    const section = {};
    if ($element.hasClass('govuk-heading-m') || $element.hasClass('govuk-heading-l')) {
        section.headingType = 'large';
    } else {
        section.headingType = 'small';
    }
    section.title = $element.text();
    section.declarationItems = [];
    return section;
};

module.exports = LegalDocumentJSONObjectBuilder;
