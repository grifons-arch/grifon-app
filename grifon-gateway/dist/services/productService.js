"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductDetail = exports.listProductsByCategory = void 0;
const prestashopParser_1 = require("./prestashopParser");
const pagination_1 = require("../utils/pagination");
const prestashopFields_1 = require("../utils/prestashopFields");
const env_1 = require("../config/env");
const buildImageUrl = (shopId, productId, imageId) => {
    const base = env_1.config.shopBaseUrls[shopId];
    return `${base}/images/products/${productId}/${imageId}`;
};
const normalizeProduct = (product, shopId, lang, allowPrice = true) => {
    const id = Number(product.id);
    const idDefaultImage = (0, prestashopFields_1.toNumber)(product.id_default_image);
    const priceValue = (0, prestashopFields_1.toNumber)(product.price);
    return {
        id,
        name: (0, prestashopFields_1.getLocalizedValue)(product.name, lang),
        price: allowPrice ? priceValue : null,
        reference: product.reference ?? null,
        defaultImage: idDefaultImage
            ? { id: idDefaultImage, url: buildImageUrl(shopId, id, idDefaultImage) }
            : null,
        active: (0, prestashopFields_1.toNumber)(product.active)
    };
};
const normalizeProductDetail = (product, shopId, lang, allowPrice = true) => {
    const id = Number(product.id);
    const images = (0, prestashopParser_1.extractResourceList)("images", product?.associations ?? {});
    const imageItems = images.map((image) => ({
        id: Number(image.id),
        url: buildImageUrl(shopId, id, Number(image.id))
    }));
    const categories = (0, prestashopParser_1.extractResourceList)("categories", product?.associations ?? {});
    const stock = (0, prestashopParser_1.extractResourceList)("stock_availables", product?.associations ?? {});
    const stockItem = stock[0];
    const priceValue = (0, prestashopFields_1.toNumber)(product.price);
    return {
        id,
        name: (0, prestashopFields_1.getLocalizedValue)(product.name, lang),
        descriptionShort: (0, prestashopFields_1.getLocalizedValue)(product.description_short, lang),
        description: (0, prestashopFields_1.getLocalizedValue)(product.description, lang),
        reference: product.reference ?? null,
        price: allowPrice ? priceValue : null,
        images: imageItems,
        manufacturer: product.id_manufacturer
            ? { id: Number(product.id_manufacturer), name: product.manufacturer_name ?? null }
            : undefined,
        categories: categories.length ? categories.map((category) => ({ id: Number(category.id) })) : undefined,
        stock: stockItem ? { quantity: (0, prestashopFields_1.toNumber)(stockItem.quantity) } : undefined
    };
};
const listProductsByCategory = async (client, shopId, categoryId, page, pageSize, sort, lang, allowPrice = false) => {
    const baseParams = {
        "filter[active]": 1,
        sort,
        limit: (0, pagination_1.toLimitParam)(page, pageSize),
        display: "[id,name,price,reference,active,id_default_image]"
    };
    const filteredData = await client.get("products", {
        ...baseParams,
        "filter[id_category_default]": categoryId
    });
    const filteredItems = (0, prestashopParser_1.extractResourceList)("products", filteredData);
    if (filteredItems.length > 0) {
        return filteredItems.map((product) => normalizeProduct(product, shopId, lang, allowPrice));
    }
    const categoryData = await client.getById("categories", categoryId);
    const category = (0, prestashopParser_1.extractResourceItem)("categories", categoryData);
    const associations = category?.associations?.products?.product;
    const productIds = Array.isArray(associations)
        ? associations.map((item) => Number(item.id))
        : associations
            ? [Number(associations.id)]
            : [];
    const pagedIds = productIds.slice((page - 1) * pageSize, page * pageSize);
    const chunks = (0, pagination_1.chunkArray)(pagedIds, 20);
    const results = [];
    for (const chunk of chunks) {
        const chunkData = await client.get("products", {
            "filter[active]": 1,
            "filter[id]": `[${chunk.join("|")}]`,
            display: "[id,name,price,reference,active,id_default_image]"
        });
        const chunkItems = (0, prestashopParser_1.extractResourceList)("products", chunkData);
        results.push(...chunkItems.map((product) => normalizeProduct(product, shopId, lang, allowPrice)));
    }
    return results;
};
exports.listProductsByCategory = listProductsByCategory;
const getProductDetail = async (client, shopId, productId, lang, allowPrice = false) => {
    const data = await client.getById("products", productId, {
        display: "full"
    });
    const product = (0, prestashopParser_1.extractResourceItem)("products", data);
    if (!product)
        return null;
    const active = (0, prestashopFields_1.toBooleanFlag)(product.active);
    if (!active)
        return null;
    return normalizeProductDetail(product, shopId, lang, allowPrice);
};
exports.getProductDetail = getProductDetail;
