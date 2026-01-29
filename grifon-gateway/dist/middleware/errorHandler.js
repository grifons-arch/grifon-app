"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const status = err.status ?? 500;
    const code = err.code ?? "INTERNAL_ERROR";
    const message = err.message ?? "Unexpected error";
    res.status(status).json({
        error: {
            code,
            message,
            details: err.details
        }
    });
};
exports.errorHandler = errorHandler;
