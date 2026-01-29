"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const priceAccessService_1 = require("../src/services/priceAccessService");
class FakeClient {
    constructor(data) {
        this.data = data;
    }
    async getById(resource, id) {
        const key = `${resource}:${id}`;
        return this.data[key];
    }
}
(0, vitest_1.describe)("getPriceAccess", () => {
    (0, vitest_1.it)("denies access for inactive customer", async () => {
        const client = new FakeClient({
            "customers:10": { customers: { customer: { id: 10, active: 0, id_default_group: 1 } } },
            "groups:1": { groups: { group: { id: 1, show_prices: 1 } } }
        });
        const result = await (0, priceAccessService_1.getPriceAccess)(client, 10);
        (0, vitest_1.expect)(result.allowed).toBe(false);
        (0, vitest_1.expect)(result.active).toBe(false);
    });
    (0, vitest_1.it)("allows access for active customer with show_prices group", async () => {
        const client = new FakeClient({
            "customers:20": { customers: { customer: { id: 20, active: 1, id_default_group: 2 } } },
            "groups:2": { groups: { group: { id: 2, show_prices: 1 } } }
        });
        const result = await (0, priceAccessService_1.getPriceAccess)(client, 20);
        (0, vitest_1.expect)(result.allowed).toBe(true);
        (0, vitest_1.expect)(result.groupShowPrices).toBe(true);
    });
});
