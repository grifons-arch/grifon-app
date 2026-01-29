"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBooleanFlag = exports.toNumber = exports.getLocalizedValue = void 0;
const getLocalizedValue = (field, lang) => {
    if (!field)
        return null;
    if (typeof field === "string")
        return field;
    const language = field.language;
    if (!language)
        return null;
    const list = Array.isArray(language) ? language : [language];
    if (lang !== undefined) {
        const match = list.find((item) => Number(item.id) === lang);
        return match?.value ?? match?.text ?? null;
    }
    const first = list[0];
    return first?.value ?? first?.text ?? null;
};
exports.getLocalizedValue = getLocalizedValue;
const toNumber = (value) => {
    if (value === undefined || value === null || value === "")
        return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
};
exports.toNumber = toNumber;
const toBooleanFlag = (value) => {
    if (value === true || value === 1 || value === "1")
        return true;
    return false;
};
exports.toBooleanFlag = toBooleanFlag;
