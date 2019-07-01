'use strict';

const {filter, isEqual, map, uniqWith} = require('lodash');
const i18next = require('i18next');

const FieldError = (param, keyword, resourcePath, contentCtx) => {
    const key = `errors.${param}.${keyword}`;
    const errorPath = `${resourcePath.replace('/', '.')}.${key}`;

    return {
        field: param,
        href: `#${param}`,
        msg: {
            summary: i18next.t(`${errorPath}.summary`, contentCtx),
            message: i18next.t(`${errorPath}.message`, contentCtx)
        }
    };
};

const generateErrors = (errs, ctx, formdata, errorPath, lang = 'en') => {
    i18next.changeLanguage(lang);
    const contentCtx = Object.assign({}, formdata, ctx, {});
    if (errs.find((e) => e.keyword === 'oneOf')) {
        return [FieldError('crossField', 'oneOf', errorPath, contentCtx)];
    }
    errs = filter(errs, ((e) => e.keyword !== 'oneOf'));
    const errors = map(errs, (e) => {
        let param;
        try {
            if (e.keyword === 'required' || e.keyword === 'switch') {
                param = e.params.missingProperty;
                return FieldError(param, 'required', errorPath);
            }
            [, param] = e.dataPath.split('.');
            if (!param) {
                param = e.dataPath
                    .replace(/\['|']/g, '');
            }
            return FieldError(param, 'invalid', errorPath);

        } catch (e) {
            throw new ReferenceError(`Error messages have not been defined for Step in content.json for errors.${param}`);
        }
    });
    return uniqWith(errors, isEqual);
};

const mapErrorsToFields = (fields, errors = []) => {
    let err = [];

    if (Array.isArray(errors[0])) {
        errors.forEach((error) => {
            error[1].forEach((e) => {
                err.push(e);
            });
        });
    } else {
        err = errors;
    }

    err.forEach((e) => {
        if (!fields[e.field]) {
            fields[e.field] = {};
        }
        fields[e.field].error = true;
        fields[e.field].errorMessage = e.msg;
        fields[e.field].href = e.href;
    });

    return fields;
};

module.exports = FieldError;
module.exports.generateErrors = generateErrors;
module.exports.mapErrorsToFields = mapErrorsToFields;
