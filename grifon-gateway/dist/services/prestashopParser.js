"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractResourceItem = exports.extractResourceList = void 0;
const resourceMap = {
    categories: "category",
    products: "product",
    customers: "customer",
    groups: "group",
    content_management_system: "content_management_system",
    images: "image",
    stock_availables: "stock_available"
};
const asArray = (value) => {
    if (!value)
        return [];
    return Array.isArray(value) ? value : [value];
};
const extractResourceList = (resource, payload) => {
    const root = payload?.prestashop ?? payload;
    const container = root?.[resource];
    if (!container)
        return [];
    const itemKey = resourceMap[resource];
    if (itemKey && container[itemKey]) {
        return asArray(container[itemKey]);
    }
    if (Array.isArray(container))
        return container;
    return asArray(container);
};
exports.extractResourceList = extractResourceList;
const extractResourceItem = (resource, payload) => {
    const list = (0, exports.extractResourceList)(resource, payload);
    if (list.length > 0)
        return list[0];
    const root = payload?.prestashop ?? payload;
    const direct = root?.[resource];
    if (!direct)
        return null;
    return direct;
};
exports.extractResourceItem = extractResourceItem;
