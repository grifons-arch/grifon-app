import { z } from "zod";

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toOptionalString = (value: unknown) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const shopQuerySchema = z.object({
  shopId: z.preprocess(toNumber, z.union([z.literal(1), z.literal(4)])).default(4),
  lang: z.preprocess(toNumber, z.number().int().positive().optional())
});

export const paginationSchema = z.object({
  page: z.preprocess(toNumber, z.number().int().min(1).max(1000)).default(1),
  pageSize: z.preprocess(toNumber, z.number().int().min(1).max(200)).default(50)
});

export const productPaginationSchema = z.object({
  page: z.preprocess(toNumber, z.number().int().min(1).max(1000)).default(1),
  pageSize: z.preprocess(toNumber, z.number().int().min(1).max(200)).default(20),
  sort: z.string().optional().default("[id_DESC]")
});

export const customerIdSchema = z.object({
  customerId: z.preprocess(toNumber, z.number().int().positive())
});

export const categoryIdSchema = z.object({
  categoryId: z.preprocess(toNumber, z.number().int().positive())
});

export const productIdSchema = z.object({
  productId: z.preprocess(toNumber, z.number().int().positive())
});

export const registerBodySchema = z
  .object({
    email: z.string().trim().email(),
    passwd: z.preprocess(toOptionalString, z.string().min(8).optional()),
    socialTitle: z.preprocess(toOptionalString, z.enum(["mr", "mrs"]).optional()),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    countryIso: z.string().trim().length(2),
    street: z.string().trim().min(1),
    city: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
    phone: z.string().trim().min(1).optional(),
    company: z.string().trim().min(1).optional(),
    vatNumber: z.string().trim().min(1).optional(),
    iban: z.string().trim().min(1).optional(),
    customerDataPrivacyAccepted: z.boolean().optional().default(false),
    newsletter: z.boolean().optional().default(false),
    termsAndPrivacyAccepted: z.boolean().optional().default(false),
    partnerOffers: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.passwd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        path: ["passwd"]
      });
    }
  });
