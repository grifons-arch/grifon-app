"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBodySchema = exports.productIdSchema = exports.categoryIdSchema = exports.customerIdSchema = exports.productPaginationSchema = exports.paginationSchema = exports.shopQuerySchema = void 0;
const zod_1 = require("zod");
const toNumber = (value) => {
    if (value === undefined || value === null || value === "")
        return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
};
const toOptionalString = (value) => {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== "string")
        return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};
exports.shopQuerySchema = zod_1.z.object({
    shopId: zod_1.z.preprocess(toNumber, zod_1.z.union([zod_1.z.literal(1), zod_1.z.literal(4)])).default(4),
    lang: zod_1.z.preprocess(toNumber, zod_1.z.number().int().positive().optional())
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess(toNumber, zod_1.z.number().int().min(1).max(1000)).default(1),
    pageSize: zod_1.z.preprocess(toNumber, zod_1.z.number().int().min(1).max(200)).default(50)
});
exports.productPaginationSchema = zod_1.z.object({
    page: zod_1.z.preprocess(toNumber, zod_1.z.number().int().min(1).max(1000)).default(1),
    pageSize: zod_1.z.preprocess(toNumber, zod_1.z.number().int().min(1).max(200)).default(20),
    sort: zod_1.z.string().optional().default("[id_DESC]")
});
exports.customerIdSchema = zod_1.z.object({
    customerId: zod_1.z.preprocess(toNumber, zod_1.z.number().int().positive())
});
exports.categoryIdSchema = zod_1.z.object({
    categoryId: zod_1.z.preprocess(toNumber, zod_1.z.number().int().positive())
});
exports.productIdSchema = zod_1.z.object({
    productId: zod_1.z.preprocess(toNumber, zod_1.z.number().int().positive())
});
exports.registerBodySchema = zod_1.z.object({
    email: zod_1.z.string().trim().email(),
    passwd: zod_1.z.preprocess(toOptionalString, zod_1.z.string().min(8).optional()),
    password: zod_1.z.preprocess(toOptionalString, zod_1.z.string().min(8).optional()),
    socialTitle: zod_1.z.preprocess(toOptionalString, zod_1.z.enum(["mr", "mrs"]).optional()),
    firstName: zod_1.z.string().trim().min(1),
    lastName: zod_1.z.string().trim().min(1),
    countryIso: zod_1.z.string().trim().length(2),
    street: zod_1.z.string().trim().min(1),
    city: zod_1.z.string().trim().min(1),
    postalCode: zod_1.z.string().trim().min(1),
    phone: zod_1.z.string().trim().min(1).optional(),
    company: zod_1.z.string().trim().min(1).optional(),
    vatNumber: zod_1.z.string().trim().min(1).optional(),
    iban: zod_1.z.string().trim().min(1).optional(),
    customerDataPrivacyAccepted: zod_1.z.boolean().optional().default(false),
    newsletter: zod_1.z.boolean().optional().default(false),
    termsAndPrivacyAccepted: zod_1.z.boolean().optional().default(false),
    partnerOffers: zod_1.z.boolean().optional()
}).superRefine((data, ctx) => {
    if (!data.passwd && !data.password) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Password is required",
            path: ["passwd"]
        });
    }
});
