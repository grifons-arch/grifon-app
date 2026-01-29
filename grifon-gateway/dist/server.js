"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const requestId_1 = require("./middleware/requestId");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const corsOptions = env_1.config.allowedOrigins === "*"
    ? { origin: true }
    : {
        origin: env_1.config.allowedOrigins.split(",").map((origin) => origin.trim())
    };
app.use(requestId_1.requestLogger);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: env_1.config.rateLimitPerMin
}));
app.use(routes_1.apiRouter);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`grifon-gateway running on port ${env_1.config.port}`);
});
