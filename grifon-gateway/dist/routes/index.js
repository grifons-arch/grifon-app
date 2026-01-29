"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("./schemas");
const PrestaShopClient_1 = require("../clients/PrestaShopClient");
const categoryService_1 = require("../services/categoryService");
const pageService_1 = require("../services/pageService");
const productService_1 = require("../services/productService");
const groupService_1 = require("../services/groupService");
const cache_1 = require("../utils/cache");
const priceAccessService_1 = require("../services/priceAccessService");
const authService_1 = require("../services/authService");
exports.apiRouter = (0, express_1.Router)();
const registerRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: env_1.config.registerRateLimitPerMin,
    standardHeaders: true,
    legacyHeaders: false
});
exports.apiRouter.get("/health", (_req, res) => {
    res.json({ ok: true });
});
exports.apiRouter.get("/v1/shops", (_req, res) => {
    res.json(env_1.shops);
});
exports.apiRouter.post("/auth/register", registerRateLimiter, (0, validate_1.validateBody)(schemas_1.registerBodySchema), async (req, res, next) => {
    try {
        const { email, passwd, password, socialTitle, firstName, lastName, countryIso, street, city, postalCode, phone, company, vatNumber, iban, customerDataPrivacyAccepted, newsletter, termsAndPrivacyAccepted, partnerOffers } = req.body;
        const resolvedPasswd = passwd ?? password;
        const response = await (0, authService_1.registerCustomer)({
            email,
            passwd: resolvedPasswd,
            socialTitle,
            firstName,
            lastName,
            countryIso,
            street,
            city,
            postalCode,
            phone,
            company,
            vatNumber,
            iban,
            customerDataPrivacyAccepted,
            newsletter,
            termsAndPrivacyAccepted,
            partnerOffers
        });
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/categories", (0, validate_1.validateQuery)(schemas_1.shopQuerySchema.merge(schemas_1.paginationSchema)), async (req, res, next) => {
    try {
        const { shopId, lang, page, pageSize } = req.query;
        const cacheKey = (0, cache_1.buildCacheKey)({
            route: "categories",
            shopId,
            lang,
            page,
            pageSize
        });
        const cached = await cache_1.cache.get(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        const { items, tree } = await (0, categoryService_1.listCategories)(client, page, pageSize, lang);
        const response = { page, pageSize, items, tree };
        await cache_1.cache.set(cacheKey, response, env_1.config.cacheTtlCategoriesSeconds);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/categories/:categoryId/products", (0, validate_1.validateParams)(schemas_1.categoryIdSchema), (0, validate_1.validateQuery)(schemas_1.shopQuerySchema.merge(schemas_1.productPaginationSchema)), async (req, res, next) => {
    try {
        const { shopId, lang, page, pageSize, sort } = req.query;
        const { categoryId } = req.params;
        const cacheKey = (0, cache_1.buildCacheKey)({
            route: `categories/${categoryId}/products`,
            shopId,
            lang,
            page,
            pageSize,
            sort
        });
        const cached = await cache_1.cache.get(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        const items = await (0, productService_1.listProductsByCategory)(client, shopId, Number(categoryId), page, pageSize, sort, lang);
        const response = { page, pageSize, items };
        await cache_1.cache.set(cacheKey, response, env_1.config.cacheTtlProductsSeconds);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/products/:productId", (0, validate_1.validateParams)(schemas_1.productIdSchema), (0, validate_1.validateQuery)(schemas_1.shopQuerySchema.merge(schemas_1.customerIdSchema.partial())), async (req, res, next) => {
    try {
        const { shopId, lang, customerId } = req.query;
        const { productId } = req.params;
        const cacheKey = (0, cache_1.buildCacheKey)({
            route: `products/${productId}`,
            shopId,
            lang,
            customerId
        });
        const cached = await cache_1.cache.get(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        let allowPrice = false;
        if (customerId) {
            const access = await (0, priceAccessService_1.getPriceAccess)(client, Number(customerId));
            allowPrice = access.allowed;
        }
        const item = await (0, productService_1.getProductDetail)(client, shopId, Number(productId), lang, allowPrice);
        if (!item) {
            res.status(404).json({
                error: { code: "NOT_FOUND", message: "Product not found", details: { productId } }
            });
            return;
        }
        await cache_1.cache.set(cacheKey, item, env_1.config.cacheTtlProductsSeconds);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/pages", (0, validate_1.validateQuery)(schemas_1.shopQuerySchema), async (req, res, next) => {
    try {
        const { shopId, lang } = req.query;
        const cacheKey = (0, cache_1.buildCacheKey)({ route: "pages", shopId, lang });
        const cached = await cache_1.cache.get(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        const items = await (0, pageService_1.listPages)(client, lang);
        const response = { items };
        await cache_1.cache.set(cacheKey, response, env_1.config.cacheTtlCategoriesSeconds);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/customer-groups", (0, validate_1.validateQuery)(schemas_1.shopQuerySchema), async (req, res, next) => {
    try {
        const { shopId, lang } = req.query;
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        const items = await (0, groupService_1.listGroupsWithMembers)(client, lang);
        res.json({ items });
    }
    catch (error) {
        next(error);
    }
});
exports.apiRouter.get("/v1/customers/:customerId/price-access", (0, validate_1.validateParams)(schemas_1.customerIdSchema), (0, validate_1.validateQuery)(schemas_1.shopQuerySchema), async (req, res, next) => {
    try {
        const { shopId, lang } = req.query;
        const { customerId } = req.params;
        const client = new PrestaShopClient_1.PrestaShopClient({ shopId, lang });
        const result = await (0, priceAccessService_1.getPriceAccess)(client, Number(customerId));
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
