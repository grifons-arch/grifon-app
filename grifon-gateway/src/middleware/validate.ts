import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
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
    req.query = result.data as Record<string, string>;
    next();
  };
};

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
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
    req.params = result.data as Record<string, string>;
    next();
  };
};

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body";
      next({
        status: 400,
        code: "VALIDATION_ERROR",
        message,
        details: result.error.flatten()
      });
      return;
    }
    req.body = result.data as Record<string, unknown>;
    next();
  };
};
