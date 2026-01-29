"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPages = void 0;
const prestashopParser_1 = require("./prestashopParser");
const prestashopFields_1 = require("../utils/prestashopFields");
const listPages = async (client, lang) => {
    const data = await client.get("content_management_system", {
        "filter[active]": 1,
        display: "[id,meta_title,content,active,meta_title,link_rewrite,meta_description,title]"
    });
    const pages = (0, prestashopParser_1.extractResourceList)("content_management_system", data);
    return pages.map((page) => ({
        id: Number(page.id),
        title: (0, prestashopFields_1.getLocalizedValue)(page.title, lang) ?? (0, prestashopFields_1.getLocalizedValue)(page.meta_title, lang),
        metaTitle: (0, prestashopFields_1.getLocalizedValue)(page.meta_title, lang),
        content: (0, prestashopFields_1.getLocalizedValue)(page.content, lang),
        active: (0, prestashopFields_1.toNumber)(page.active)
    }));
};
exports.listPages = listPages;
