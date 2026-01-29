"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomer = void 0;
const PrestaShopClient_1 = require("../clients/PrestaShopClient");
const env_1 = require("../config/env");
const prestashopParser_1 = require("./prestashopParser");
const xml_1 = require("../utils/xml");
const PENDING_STATUS = "PENDING_WHOLESALE_APPROVAL";
const buildCustomerPayload = (schema, request, groupIds) => {
    const root = schema?.prestashop ?? schema;
    const baseCustomer = root?.customer ?? {};
    const associations = groupIds.length
        ? {
            groups: {
                group: groupIds.map((id) => ({ id }))
            }
        }
        : undefined;
    const customerPayload = {
        ...baseCustomer,
        firstname: request.firstName,
        lastname: request.lastName,
        email: request.email,
        passwd: request.passwd,
        active: "0",
        id_default_group: env_1.config.pendingWholesaleGroupId ?? baseCustomer.id_default_group,
        id_shop: env_1.config.defaultShopId,
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
const buildAddressPayload = (schema, request, customerId, countryId) => {
    const root = schema?.prestashop ?? schema;
    const baseAddress = root?.address ?? {};
    const addressPayload = {
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
const resolveGenderId = (socialTitle) => {
    if (socialTitle === "mr")
        return 1;
    if (socialTitle === "mrs")
        return 2;
    return undefined;
};
const resolveGroupIds = (countryIso) => {
    const groupIds = new Set();
    if (env_1.config.pendingWholesaleGroupId) {
        groupIds.add(env_1.config.pendingWholesaleGroupId);
    }
    const countryGroupId = env_1.config.countryGroupMap[countryIso.toUpperCase()];
    if (countryGroupId) {
        groupIds.add(countryGroupId);
    }
    return Array.from(groupIds);
};
const findCustomerByEmail = async (client, email) => {
    const payload = await client.get("customers", {
        "filter[email]": `[${email}]`,
        display: "[id,email]",
        limit: 1
    });
    const customers = (0, prestashopParser_1.extractResourceList)("customers", payload);
    return customers.length > 0;
};
const resolveCountryId = async (client, countryIso) => {
    const payload = await client.get("countries", {
        "filter[iso_code]": `[${countryIso.toUpperCase()}]`,
        display: "[id,iso_code]",
        limit: 1
    });
    const countries = (0, prestashopParser_1.extractResourceList)("countries", payload);
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
const registerCustomer = async (request) => {
    const client = new PrestaShopClient_1.PrestaShopClient({ shopId: env_1.config.defaultShopId });
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
    const payload = buildCustomerPayload(schema, {
        ...request,
        email,
        passwd
    }, groupIds);
    const xmlBody = (0, xml_1.buildXmlFromJson)(payload);
    try {
        const created = await client.postXml("customers", xmlBody);
        const customer = (0, prestashopParser_1.extractResourceItem)("customer", created);
        const customerId = customer?.id ?? customer?.id_customer;
        if (!customerId) {
            throw {
                status: 502,
                code: "UPSTREAM_ERROR",
                message: "Missing customer id in Prestashop response"
            };
        }
        const addressSchema = await client.get("addresses", { schema: "blank" });
        const addressPayload = buildAddressPayload(addressSchema, request, String(customerId), countryId);
        const addressBody = (0, xml_1.buildXmlFromJson)(addressPayload);
        await client.postXml("addresses", addressBody);
        return {
            customerId: String(customerId),
            status: PENDING_STATUS,
            message: "Η αίτηση καταχωρήθηκε και βρίσκεται σε αναμονή έγκρισης."
        };
    }
    catch (error) {
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
exports.registerCustomer = registerCustomer;
