import pino, { Logger } from "pino";
import { PrestaShopClient } from "../clients/PrestaShopClient";
import { config } from "../config/env";
import { extractResourceItem, extractResourceList } from "./prestashopParser";
import { buildXmlFromJson } from "../utils/xml";

export interface RegisterRequest {
  email: string;
  passwd: string;
  socialTitle?: "mr" | "mrs";
  firstName: string;
  lastName: string;
  countryIso: string;
  street: string;
  city: string;
  postalCode: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  iban?: string;
  customerDataPrivacyAccepted?: boolean;
  newsletter?: boolean;
  termsAndPrivacyAccepted?: boolean;
  partnerOffers?: boolean;
}

export interface RegisterResponse {
  customerId: string;
  status: string;
  message: string;
}

const PENDING_STATUS = "PENDING_WHOLESALE_APPROVAL";
const logger = pino({ name: "authService" });

const buildCustomerPayload = (
  schema: unknown,
  request: RegisterRequest,
  groupIds: number[]
): Record<string, unknown> => {
  const root = (schema as any)?.prestashop ?? schema;
  const baseCustomer = (root as any)?.customer ?? {};
  const associations = groupIds.length
    ? {
        groups: {
          group: groupIds.map((id) => ({ id }))
        }
      }
    : undefined;
  const customerPayload: Record<string, unknown> = {
    ...baseCustomer,
    firstname: request.firstName,
    lastname: request.lastName,
    email: request.email,
    passwd: {
      text: request.passwd
    },
    active: "0",
    id_default_group: config.pendingWholesaleGroupId ?? baseCustomer.id_default_group,
    id_shop: config.defaultShopId,
    associations
  };

  const genderId = resolveGenderId(request.socialTitle);
  if (genderId) {
    customerPayload.id_gender = genderId;
  }
  if (request.newsletter !== undefined) {
    customerPayload.newsletter = request.newsletter ? "1" : "0";
  }
  if (request.partnerOffers !== undefined) {
    customerPayload.optin = request.partnerOffers ? "1" : "0";
  }
  if ("company" in baseCustomer && request.company) {
    customerPayload.company = request.company;
  }
  if ("phone" in baseCustomer && request.phone) {
    customerPayload.phone = request.phone;
  }

  return {
    prestashop: {
      customer: customerPayload
    }
  };
};

const buildAddressPayload = (
  schema: unknown,
  request: RegisterRequest,
  customerId: string,
  countryId: number
): Record<string, unknown> => {
  const root = (schema as any)?.prestashop ?? schema;
  const baseAddress = (root as any)?.address ?? {};
  const addressPayload: Record<string, unknown> = {
    ...baseAddress,
    id_customer: customerId,
    id_country: countryId,
    firstname: request.firstName,
    lastname: request.lastName,
    address1: request.street,
    city: request.city,
    postcode: request.postalCode,
    alias: "Default"
  };

  if ("company" in baseAddress && request.company) {
    addressPayload.company = request.company;
  }
  if ("vat_number" in baseAddress && request.vatNumber) {
    addressPayload.vat_number = request.vatNumber;
  }
  if ("other" in baseAddress && request.iban) {
    addressPayload.other = `IBAN: ${request.iban}`;
  }
  if (request.phone) {
    if ("phone" in baseAddress) {
      addressPayload.phone = request.phone;
    }
    if ("phone_mobile" in baseAddress) {
      addressPayload.phone_mobile = request.phone;
    }
  }

  return {
    prestashop: {
      address: addressPayload
    }
  };
};

const resolveGenderId = (socialTitle?: RegisterRequest["socialTitle"]): number | undefined => {
  if (socialTitle === "mr") return 1;
  if (socialTitle === "mrs") return 2;
  return undefined;
};

const resolveGroupIds = (countryIso: string): number[] => {
  const groupIds = new Set<number>();
  if (config.pendingWholesaleGroupId) {
    groupIds.add(config.pendingWholesaleGroupId);
  }
  const countryGroupId = config.countryGroupMap[countryIso.toUpperCase()];
  if (countryGroupId) {
    groupIds.add(countryGroupId);
  }
  return Array.from(groupIds);
};

const findCustomerByEmail = async (client: PrestaShopClient, email: string): Promise<boolean> => {
  const payload = await client.get("customers", {
    "filter[email]": `[${email}]`,
    display: "[id,email]",
    limit: 1
  });
  const customers = extractResourceList<any>("customers", payload);
  return customers.length > 0;
};

const resolveCountryId = async (client: PrestaShopClient, countryIso: string): Promise<number> => {
  const payload = await client.get("countries", {
    "filter[iso_code]": `[${countryIso.toUpperCase()}]`,
    display: "[id,iso_code]",
    limit: 1
  });
  const countries = extractResourceList<any>("countries", payload);
  const countryId = countries?.[0]?.id;
  if (!countryId) {
    throw {
      status: 400,
      code: "INVALID_COUNTRY",
      message: "Invalid country ISO code"
    };
  }
  return Number(countryId);
};

export const registerCustomer = async (
  request: RegisterRequest,
  log: Logger = logger
): Promise<RegisterResponse> => {
  const client = new PrestaShopClient({ shopId: config.defaultShopId });
  const email = request.email.trim().toLowerCase();
  const passwd = request.passwd?.trim();
  if (!passwd) {
    throw {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Password is required"
    };
  }

  const exists = await findCustomerByEmail(client, email);
  if (exists) {
    throw {
      status: 409,
      code: "EMAIL_EXISTS",
      message: "Email already registered"
    };
  }

  const schema = await client.get("customers", { schema: "blank" });
  const countryId = await resolveCountryId(client, request.countryIso);
  const groupIds = resolveGroupIds(request.countryIso);
  const payload = buildCustomerPayload(
    schema,
    {
      ...request,
      email,
      passwd
    },
    groupIds
  );
  const safePayload = JSON.parse(JSON.stringify(payload));
  const safeCustomer = (safePayload as any)?.prestashop?.customer;
  if (safeCustomer?.passwd) {
    if (typeof safeCustomer.passwd === "object") {
      safeCustomer.passwd = { text: "***" };
    } else {
      safeCustomer.passwd = "***";
    }
  }
  const hasPasswd = Boolean((payload as any)?.prestashop?.customer?.passwd);
  log.info(
    {
      payload: safePayload,
      hasPasswd
    },
    "Prestashop customer payload"
  );
  process.stdout.write(
    `${JSON.stringify({
      msg: "Prestashop customer payload",
      payload: safePayload,
      hasPasswd
    })}\n`
  );
  process.stderr.write(
    `${JSON.stringify({
      msg: "Prestashop customer payload",
      payload: safePayload,
      hasPasswd
    })}\n`
  );
  const xmlBody = buildXmlFromJson(payload);

  try {
    const created = await client.postXml("customers", xmlBody);
    const customer = extractResourceItem<any>("customer", created);
    const customerId = customer?.id ?? customer?.id_customer;
    if (!customerId) {
      throw {
        status: 502,
        code: "UPSTREAM_ERROR",
        message: "Missing customer id in Prestashop response"
      };
    }
    const addressSchema = await client.get("addresses", { schema: "blank" });
    const addressPayload = buildAddressPayload(
      addressSchema,
      request,
      String(customerId),
      countryId
    );
    const addressBody = buildXmlFromJson(addressPayload);
    await client.postXml("addresses", addressBody);
    return {
      customerId: String(customerId),
      status: PENDING_STATUS,
      message: "Η αίτηση καταχωρήθηκε και βρίσκεται σε αναμονή έγκρισης."
    };
  } catch (error: any) {
    log.warn(
      {
        status: error?.status,
        code: error?.code,
        message: error?.message
      },
      "Prestashop customer creation failed"
    );
    const message = String(error?.message ?? "Prestashop error");
    if (message.toLowerCase().includes("email") && message.toLowerCase().includes("exists")) {
      throw {
        status: 409,
        code: "EMAIL_EXISTS",
        message: "Email already registered"
      };
    }
    if (error?.status) {
      throw error;
    }
    throw {
      status: 502,
      code: "UPSTREAM_ERROR",
      message: "Failed to create customer"
    };
  }
};
