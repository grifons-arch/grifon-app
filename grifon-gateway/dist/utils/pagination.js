"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = exports.toLimitParam = void 0;
const toLimitParam = (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    return `${offset},${pageSize}`;
};
exports.toLimitParam = toLimitParam;
const chunkArray = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};
exports.chunkArray = chunkArray;
