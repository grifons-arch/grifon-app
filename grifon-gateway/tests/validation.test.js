"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const schemas_1 = require("../src/routes/schemas");
(0, vitest_1.describe)("shopId validation", () => {
    (0, vitest_1.it)("accepts valid shopId", () => {
        const result = schemas_1.shopQuerySchema.safeParse({ shopId: "4" });
        (0, vitest_1.expect)(result.success).toBe(true);
        if (result.success) {
            (0, vitest_1.expect)(result.data.shopId).toBe(4);
        }
    });
    (0, vitest_1.it)("rejects invalid shopId", () => {
        const result = schemas_1.shopQuerySchema.safeParse({ shopId: "3" });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});
