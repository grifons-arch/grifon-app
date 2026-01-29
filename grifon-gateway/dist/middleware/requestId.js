"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const crypto_1 = require("crypto");
const pino_http_1 = __importDefault(require("pino-http"));
exports.requestLogger = (0, pino_http_1.default)({
    genReqId: (req, res) => {
        const existing = req.headers["x-request-id"];
        const id = typeof existing === "string" ? existing : (0, crypto_1.randomUUID)();
        res.setHeader("x-request-id", id);
        return id;
    },
    redact: {
        paths: ["req.headers.authorization", "req.body.passwd"],
        remove: true
    }
});
