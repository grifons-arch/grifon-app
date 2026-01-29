"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.validateParams = exports.validateQuery = void 0;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next({
                status: 400,
                code: "VALIDATION_ERROR",
                message: "Invalid query parameters",
                details: result.error.flatten()
            });
            return;
        }
        req.query = result.data;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next({
                status: 400,
                code: "VALIDATION_ERROR",
                message: "Invalid route parameters",
                details: result.error.flatten()
            });
            return;
        }
        req.params = result.data;
        next();
    };
};
exports.validateParams = validateParams;
const validateBody = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = ((_a = result.error.issues[0]) === null || _a === void 0 ? void 0 : _a.message) || "Invalid request body";
            next({
                status: 400,
                code: "VALIDATION_ERROR",
                message,
                details: result.error.flatten()
            });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
