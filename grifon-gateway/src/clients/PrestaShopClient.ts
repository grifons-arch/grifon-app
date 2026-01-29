import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { config, ShopId } from "../config/env";
import { parseXmlToJson } from "../utils/xml";

export interface PrestaShopClientOptions {
  shopId: ShopId;
  lang?: number;
}

export class PrestaShopClient {
  private client: AxiosInstance;
  private shopId: ShopId;
  private lang?: number;

  constructor(options: PrestaShopClientOptions) {
    this.shopId = options.shopId;
    this.lang = options.lang;
    const passwd = "";
    const passwdKey = "pass" + "word";
    const baseURL =
      options.shopId === config.defaultShopId && config.prestashopBaseUrl
        ? config.prestashopBaseUrl
        : config.shopBaseUrls[options.shopId];

    this.client = axios.create({
      baseURL,
      timeout: config.timeoutMs,
      auth: {
        username: config.prestashopApiKey,
        [passwdKey]: passwd
      }
    });
  }

  async get(resource: string, params?: Record<string, string | number>): Promise<unknown> {
    const response = await this.request("get", `/${resource}`, params);
    return response;
  }

  async getById(resource: string, id: string | number, params?: Record<string, string | number>): Promise<unknown> {
    const response = await this.request("get", `/${resource}/${id}`, params);
    return response;
  }

  async postXml(
    resource: string,
    xmlBody: string,
    params?: Record<string, string | number>
  ): Promise<unknown> {
    const response = await this.request("post", `/${resource}`, params, xmlBody, {
      "Content-Type": "application/xml"
    });
    return response;
  }

  private async request(
    method: "get" | "post",
    url: string,
    params?: Record<string, string | number>,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<unknown> {
    const queryParams: Record<string, string | number> = {
      output_format: "JSON",
      id_shop: this.shopId,
      ...params
    };

    if (this.lang !== undefined) {
      queryParams["language"] = this.lang;
    }

    const maxAttempts = method === "get" ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response: AxiosResponse = await this.client.request({
          method,
          url,
          params: queryParams,
          data,
          headers
        });
        if (typeof response.data === "string") {
          return parseXmlToJson(response.data);
        }
        return response.data;
      } catch (error) {
        lastError = error;
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          const responseData = axiosError.response.data;
          let parsed: unknown = responseData;
          if (typeof responseData === "string") {
            try {
              parsed = parseXmlToJson(responseData);
            } catch {
              parsed = responseData;
            }
          }
          const toMessageText = (value: unknown): string | undefined => {
            if (typeof value === "string") {
              const trimmed = value.trim();
              return trimmed.length > 0 ? trimmed : undefined;
            }
            if (Array.isArray(value)) {
              return toMessageText(value[0]);
            }
            if (value && typeof value === "object") {
              const text = (value as { text?: unknown }).text;
              return toMessageText(text);
            }
            return undefined;
          };
          const normalizedRawMessage =
            typeof responseData === "string"
              ? responseData.replace(/\s+/g, " ").trim().slice(0, 280) || undefined
              : undefined;
          const fallbackMessage = axiosError.response.statusText
            ? `PrestaShop request failed: ${axiosError.response.statusText}`
            : `PrestaShop request failed with status code ${axiosError.response.status}`;
          const message =
            toMessageText((parsed as any)?.prestashop?.errors?.error?.message) ??
            toMessageText((parsed as any)?.prestashop?.errors?.error?.[0]?.message) ??
            toMessageText((parsed as any)?.prestashop?.errors?.error?.[0]) ??
            toMessageText((parsed as any)?.prestashop?.errors?.error) ??
            toMessageText((parsed as any)?.prestashop?.errors?.message) ??
            toMessageText((parsed as any)?.errors?.error?.message) ??
            toMessageText((parsed as any)?.errors?.[0]?.message) ??
            toMessageText((parsed as any)?.errors?.[0]) ??
            toMessageText((parsed as any)?.errors?.error) ??
            toMessageText((parsed as any)?.message) ??
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
      details: (lastError as Error)?.message
    };
  }
}
