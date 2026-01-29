"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGroupsWithMembers = void 0;
const prestashopParser_1 = require("./prestashopParser");
const prestashopFields_1 = require("../utils/prestashopFields");
const priceAccessService_1 = require("./priceAccessService");
const listGroupsWithMembers = async (client, lang) => {
    const data = await client.get("groups", {
        "filter[show_prices]": 1,
        display: "full"
    });
    const groups = (0, prestashopParser_1.extractResourceList)("groups", data);
    const results = [];
    for (const group of groups) {
        const groupId = Number(group.id);
        const members = await (0, priceAccessService_1.getGroupMembersCount)(client, groupId);
        results.push({
            id: groupId,
            groupName: (0, prestashopFields_1.getLocalizedValue)(group.name, lang),
            discountPercent: (0, prestashopFields_1.toNumber)(group.price_display_method) ?? (0, prestashopFields_1.toNumber)(group.reduction),
            members,
            showPrices: (0, prestashopFields_1.toBooleanFlag)(group.show_prices),
            creationDate: group.date_add ?? null
        });
    }
    return results;
};
exports.listGroupsWithMembers = listGroupsWithMembers;
