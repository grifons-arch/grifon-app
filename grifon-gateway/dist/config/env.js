"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shops = exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("3000"),
    ALLOWED_ORIGINS: zod_1.z.string().default("*"),
    PRESTASHOP_API_KEY: zod_1.z.string().min(1),
    PRESTASHOP_BASE_URL: zod_1.z.string().url().optional().default(""),
    DEFAULT_SHOP_ID: zod_1.z.enum(["1", "4"]).default("4"),
    PENDING_WHOLESALE_GROUP_ID: zod_1.z.string().optional().default(""),
    COUNTRY_GROUP_MAP: zod_1.z.string().optional().default("{}"),
    SHOP_GR_BASE_URL: zod_1.z.string().url().default("https://grifon.gr/api"),
    SHOP_SE_BASE_URL: zod_1.z.string().url().default("http://grifon.se/api"),
    CACHE_TTL_CATEGORIES_SECONDS: zod_1.z.string().default("600"),
    CACHE_TTL_PRODUCTS_SECONDS: zod_1.z.string().default("120"),
    TIMEOUT_MS: zod_1.z.string().default("8000"),
    RATE_LIMIT_PER_MIN: zod_1.z.string().default("120"),
    REGISTER_RATE_LIMIT_PER_MIN: zod_1.z.string().default("10"),
    REDIS_URL: zod_1.z.string().optional().default("")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration", parsed.error.flatten());
    process.exit(1);
}
const env = parsed.data;
const parseCountryGroupMap = (value) => {
    if (!value)
        return {};
    try {
        const parsedMap = JSON.parse(value);
        if (typeof parsedMap !== "object" || parsedMap === null) {
            return {};
        }
        return Object.entries(parsedMap).reduce((acc, [key, val]) => {
            const id = Number(val);
            if (Number.isNaN(id)) {
                return acc;
            }
            acc[key.toUpperCase()] = id;
            return acc;
        }, {});
    }
    catch {
        return {};
    }
};
exports.config = {
    port: Number(env.PORT),
    allowedOrigins: env.ALLOWED_ORIGINS,
    prestashopApiKey: env.PRESTASHOP_API_KEY,
    prestashopBaseUrl: env.PRESTASHOP_BASE_URL || env.SHOP_GR_BASE_URL,
    shopBaseUrls: {
        4: env.SHOP_GR_BASE_URL,
        1: env.SHOP_SE_BASE_URL
    },
    defaultShopId: env.DEFAULT_SHOP_ID === "1" ? 1 : 4,
    pendingWholesaleGroupId: env.PENDING_WHOLESALE_GROUP_ID
        ? Number(env.PENDING_WHOLESALE_GROUP_ID)
        : undefined,
    countryGroupMap: parseCountryGroupMap(env.COUNTRY_GROUP_MAP),
    cacheTtlCategoriesSeconds: Number(env.CACHE_TTL_CATEGORIES_SECONDS),
    cacheTtlProductsSeconds: Number(env.CACHE_TTL_PRODUCTS_SECONDS),
    timeoutMs: Number(env.TIMEOUT_MS),
    rateLimitPerMin: Number(env.RATE_LIMIT_PER_MIN),
    registerRateLimitPerMin: Number(env.REGISTER_RATE_LIMIT_PER_MIN),
    redisUrl: env.REDIS_URL
};
exports.shops = [
    { id: 4, code: "GR", domain: "grifon.gr", baseUrl: env.SHOP_GR_BASE_URL },
    { id: 1, code: "SE", domain: "grifon.se", baseUrl: env.SHOP_SE_BASE_URL }
];
