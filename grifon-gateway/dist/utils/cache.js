"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCacheKey = exports.cache = void 0;
const lru_cache_1 = require("lru-cache");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
class MemoryCache {
    constructor() {
        this.cache = new lru_cache_1.LRUCache({
            max: 5000,
            ttlAutopurge: true
        });
    }
    async get(key) {
        return this.cache.get(key);
    }
    async set(key, value, ttlSeconds) {
        this.cache.set(key, value, { ttl: ttlSeconds * 1000 });
    }
}
class RedisCache {
    constructor(redisUrl) {
        this.client = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: 1 });
    }
    async get(key) {
        const raw = await this.client.get(key);
        if (!raw)
            return undefined;
        return JSON.parse(raw);
    }
    async set(key, value, ttlSeconds) {
        await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
}
exports.cache = env_1.config.redisUrl
    ? new RedisCache(env_1.config.redisUrl)
    : new MemoryCache();
const buildCacheKey = (parts) => {
    const entries = Object.entries(parts)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    return entries;
};
exports.buildCacheKey = buildCacheKey;
