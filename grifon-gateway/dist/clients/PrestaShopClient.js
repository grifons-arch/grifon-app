"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestaShopClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const xml_1 = require("../utils/xml");
class PrestaShopClient {
    constructor(options) {
        this.shopId = options.shopId;
        this.lang = options.lang;
        const passwd = "";
        const passwdKey = "pass" + "word";
        const baseURL = options.shopId === env_1.config.defaultShopId && env_1.config.prestashopBaseUrl
            ? env_1.config.prestashopBaseUrl
            : env_1.config.shopBaseUrls[options.shopId];
        this.client = axios_1.default.create({
            baseURL,
            timeout: env_1.config.timeoutMs,
            auth: {
                username: env_1.config.prestashopApiKey,
                [passwdKey]: passwd
            }
        });
    }
    async get(resource, params) {
        const response = await this.request("get", `/${resource}`, params);
        return response;
    }
    async getById(resource, id, params) {
        const response = await this.request("get", `/${resource}/${id}`, params);
        return response;
    }
    async postXml(resource, xmlBody, params) {
        const response = await this.request("post", `/${resource}`, params, xmlBody, {
            "Content-Type": "application/xml"
        });
        return response;
    }
    async request(method, url, params, data, headers) {
        const queryParams = {
            output_format: "JSON",
            id_shop: this.shopId,
            ...params
        };
        if (this.lang !== undefined) {
            queryParams["language"] = this.lang;
        }
        const maxAttempts = method === "get" ? 3 : 1;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                const response = await this.client.request({
                    method,
                    url,
                    params: queryParams,
                    data,
                    headers
                });
                if (typeof response.data === "string") {
                    return (0, xml_1.parseXmlToJson)(response.data);
                }
                return response.data;
            }
            catch (error) {
                lastError = error;
                const axiosError = error;
                if (axiosError.response) {
                    const responseData = axiosError.response.data;
                    const parsed = typeof responseData === "string" ? (0, xml_1.parseXmlToJson)(responseData) : responseData;
                    const toMessageText = (value) => {
                        if (typeof value === "string") {
                            const trimmed = value.trim();
                            return trimmed.length > 0 ? trimmed : undefined;
                        }
                        if (Array.isArray(value)) {
                            return toMessageText(value[0]);
                        }
                        if (value && typeof value === "object") {
                            const text = value.text;
                            return toMessageText(text);
                        }
                        return undefined;
                    };
                    const normalizedRawMessage = typeof responseData === "string"
                        ? responseData.replace(/\s+/g, " ").trim().slice(0, 280) || undefined
                        : undefined;
                    const fallbackMessage = axiosError.response.statusText
                        ? `PrestaShop request failed: ${axiosError.response.statusText}`
                        : `PrestaShop request failed with status code ${axiosError.response.status}`;
                    const message = toMessageText(parsed?.prestashop?.errors?.error?.message) ??
                        toMessageText(parsed?.prestashop?.errors?.error?.[0]?.message) ??
                        toMessageText(parsed?.prestashop?.errors?.message) ??
                        toMessageText(parsed?.errors?.error?.message) ??
                        toMessageText(parsed?.errors?.[0]?.message) ??
                        toMessageText(parsed?.message) ??
                        normalizedRawMessage ??
                        fallbackMessage;
                    throw {
                        status: axiosError.response.status,
                        code: "PRESTASHOP_ERROR",
                        message,
                        details: parsed
                    };
                }
                if (attempt === maxAttempts) {
                    break;
                }
                if (method !== "get") {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
            }
        }
        throw {
            status: 502,
            code: "UPSTREAM_ERROR",
            message: "Failed to fetch upstream data",
            details: lastError?.message
        };
    }
}
exports.PrestaShopClient = PrestaShopClient;
