"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupMembersCount = exports.getPriceAccess = void 0;
const prestashopParser_1 = require("./prestashopParser");
const prestashopFields_1 = require("../utils/prestashopFields");
const getPriceAccess = async (client, customerId) => {
    const data = await client.getById("customers", customerId, { display: "full" });
    const customer = (0, prestashopParser_1.extractResourceItem)("customers", data);
    if (!customer) {
        return {
            customerId,
            active: false,
            defaultGroupId: null,
            groupShowPrices: false,
            allowed: false
        };
    }
    const active = (0, prestashopFields_1.toBooleanFlag)(customer.active);
    const defaultGroupId = customer.id_default_group ? Number(customer.id_default_group) : null;
    let groupShowPrices = false;
    if (defaultGroupId) {
        const groupData = await client.getById("groups", defaultGroupId, { display: "full" });
        const group = (0, prestashopParser_1.extractResourceItem)("groups", groupData);
        if (group) {
            groupShowPrices = (0, prestashopFields_1.toBooleanFlag)(group.show_prices);
        }
    }
    const allowed = active && groupShowPrices;
    return {
        customerId,
        active,
        defaultGroupId,
        groupShowPrices,
        allowed
    };
};
exports.getPriceAccess = getPriceAccess;
const getGroupMembersCount = async (client, groupId) => {
    const pageSize = 100;
    let offset = 0;
    let total = 0;
    while (true) {
        const data = await client.get("customers", {
            "filter[active]": 1,
            "filter[id_default_group]": groupId,
            display: "[id]",
            limit: `${offset},${pageSize}`
        });
        const customers = (0, prestashopParser_1.extractResourceList)("customers", data);
        total += customers.length;
        if (customers.length < pageSize) {
            break;
        }
        offset += pageSize;
    }
    return total;
};
exports.getGroupMembersCount = getGroupMembersCount;
